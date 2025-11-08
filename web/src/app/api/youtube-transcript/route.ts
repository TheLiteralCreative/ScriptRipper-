import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import ytdl from 'ytdl-core';

interface TranscriptRequestBody {
  url?: string;
  language?: string;
}

const YOUTUBE_TRANSCRIPT_BASE = 'https://www.youtube.com/api/timedtext';
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://www.youtube.com/',
};

const htmlEntityMap: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

function decodeHtmlEntities(text: string): string {
  const decoded = text
    .replace(/&(#\d+|[a-zA-Z]+);/g, (entity) => {
      if (htmlEntityMap[entity]) {
        return htmlEntityMap[entity];
      }
      const match = entity.match(/&#(\d+);/);
      if (match) {
        return String.fromCharCode(Number(match[1]));
      }
      return entity;
    });

  return decoded.replace(/\r?\n\s*/g, '\n').trim();
}

function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1);
    }

    if (
      parsed.hostname.includes('youtube.com') ||
      parsed.hostname.includes('youtube-nocookie.com')
    ) {
      if (parsed.pathname.startsWith('/watch')) {
        return parsed.searchParams.get('v');
      }

      const pathSegments = parsed.pathname.split('/').filter(Boolean);
      if (pathSegments[0] === 'embed' || pathSegments[0] === 'v') {
        return pathSegments[1] ?? null;
      }

      if (pathSegments[0] === 'shorts') {
        return pathSegments[1] ?? null;
      }
    }
  } catch (error) {
    return null;
  }
  return null;
}

interface TranscriptTrack {
  langCode: string;
  kind?: string;
  name?: string;
  langOriginal?: string;
  langTranslated?: string;
  langDefault?: boolean;
  vssId?: string;
  baseUrl?: string;
  isPlayerTrack?: boolean;
}

interface TranscriptAttempt {
  track: TranscriptTrack;
  status?: number;
  message?: string;
  source?: 'player' | 'timedtext' | 'library' | 'proxy';
}

function parseTrackList(xml: string): TranscriptTrack[] {
  const trackRegex = /<track\s+([^>]+?)\/>/g;
  const tracks: TranscriptTrack[] = [];
  let match: RegExpExecArray | null;

  while ((match = trackRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    const track: TranscriptTrack = { langCode: '' };
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(attrs)) !== null) {
      const key = attrMatch[1];
      const value = attrMatch[2];
      switch (key) {
        case 'lang_code':
          track.langCode = value;
          break;
        case 'kind':
          track.kind = value;
          break;
        case 'name':
          track.name = value;
          break;
        case 'lang_original':
          track.langOriginal = value;
          break;
        case 'lang_translated':
          track.langTranslated = value;
          break;
        case 'lang_default':
          track.langDefault = value === 'true';
          break;
        case 'vss_id':
          track.vssId = value;
          break;
        default:
          break;
      }
    }

    if (track.langCode) {
      tracks.push(track);
    }
  }

  return tracks;
}

function prioritizeTracks(language: string, tracks: TranscriptTrack[]): TranscriptTrack[] {
  const normalized = language.toLowerCase();

  return [...tracks].sort((a, b) => {
    const score = (track: TranscriptTrack) => {
      let value = 0;
      const langCode = track.langCode?.toLowerCase();

      if (langCode === normalized) {
        value += 100;
      } else if (langCode?.startsWith(`${normalized}-`)) {
        value += 80;
      }

      if (track.langDefault) {
        value += 20;
      }

      if (track.isPlayerTrack) {
        value += 15;
      }

      if (!track.kind) {
        value += 10;
      } else if (track.kind === 'asr') {
        value += 5;
      }

      // Prefer manually created captions over auto-generated
      if (track.vssId?.startsWith('a.')) {
        value -= 5;
      }

      return value;
    };

    return score(b) - score(a);
  });
}

async function fetchTrackList(videoId: string): Promise<TranscriptTrack[]> {
  const url = `${YOUTUBE_TRANSCRIPT_BASE}?type=list&v=${videoId}&client=yt`;
  const response = await fetch(url, {
    cache: 'no-store',
    headers: REQUEST_HEADERS,
  });
  if (!response.ok) {
    return [];
  }

  const xml = await response.text();
  if (!xml.trim()) {
    return [];
  }

  return parseTrackList(xml);
}

async function fetchTranscriptForTrack(
  videoId: string,
  track: TranscriptTrack,
  attempts: TranscriptAttempt[]
): Promise<string | null> {
  if (track.baseUrl) {
    try {
      const url = new URL(track.baseUrl);
      if (!url.searchParams.has('fmt')) {
        url.searchParams.set('fmt', 'json3');
      }
      const response = await fetch(url.toString(), {
        cache: 'no-store',
        headers: REQUEST_HEADERS,
      });
      if (!response.ok) {
        attempts.push({
          track,
          status: response.status,
          message: response.statusText,
          source: 'player',
        });
        return null;
      }

      const data = await response.json().catch((error) => {
        attempts.push({
          track,
          status: response.status,
          message: `Invalid JSON payload: ${error instanceof Error ? error.message : 'unknown error'}`,
          source: 'player',
        });
        return null;
      });

      if (!data || !Array.isArray(data.events)) {
        attempts.push({
          track,
          status: response.status,
          message: 'Malformed caption payload returned by YouTube.',
          source: 'player',
        });
        return null;
      }

      const segments: string[] = [];
      for (const event of data.events) {
        if (!event?.segs) {
          continue;
        }
        const eventSegments: string[] = [];
        for (const segment of event.segs) {
          if (typeof segment?.utf8 === 'string') {
            eventSegments.push(segment.utf8);
          }
        }

        if (eventSegments.length > 0) {
          segments.push(eventSegments.join(''));
        }
      }

      if (segments.length === 0) {
        attempts.push({
          track,
          status: response.status,
          message: 'Received empty caption segments.',
          source: 'player',
        });
        return null;
      }

      const joined = segments.join('\n');
      return decodeHtmlEntities(joined);
    } catch (error) {
      attempts.push({
        track,
        message: `Player caption fetch failed: ${error instanceof Error ? error.message : 'unknown error'}`,
        source: 'player',
      });
      return null;
    }
  }

  const searchParams = new URLSearchParams({
    fmt: 'json3',
    v: videoId,
    lang: track.langCode,
  });

  if (track.kind) {
    searchParams.set('kind', track.kind);
  }

  if (track.name) {
    searchParams.set('name', track.name);
  }

  searchParams.set('client', 'yt');
  if (track.vssId) {
    searchParams.set('vss_id', track.vssId);
    if (!track.langCode) {
      searchParams.delete('lang');
    }
  }
  const url = `${YOUTUBE_TRANSCRIPT_BASE}?${searchParams.toString()}`;
  let response: Response;

  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: REQUEST_HEADERS,
    });
  } catch (error) {
    attempts.push({
      track,
      message: `Request failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      source: 'timedtext',
    });
    return null;
  }

  if (!response.ok) {
    attempts.push({ track, status: response.status, message: response.statusText, source: 'timedtext' });
    return null;
  }

  const data = await response.json().catch((error) => {
    attempts.push({
      track,
      status: response.status,
      message: `Invalid JSON payload: ${error instanceof Error ? error.message : 'unknown error'}`,
      source: 'timedtext',
    });
    return null;
  });

  if (!data || !Array.isArray(data.events)) {
    attempts.push({
      track,
      status: response.status,
      message: 'Malformed caption payload returned by YouTube.',
      source: 'timedtext',
    });
    return null;
  }

  const segments: string[] = [];
  for (const event of data.events) {
    if (!event?.segs) {
      continue;
    }
    const eventSegments: string[] = [];
    for (const segment of event.segs) {
      if (typeof segment?.utf8 === 'string') {
        eventSegments.push(segment.utf8);
      }
    }

    if (eventSegments.length > 0) {
      segments.push(eventSegments.join(''));
    }
  }

  if (segments.length === 0) {
    attempts.push({
      track,
      status: response.status,
      message: 'Received empty caption segments.',
      source: 'timedtext',
    });
    return null;
  }

  const joined = segments.join('\n');
  return decodeHtmlEntities(joined);
}

async function fetchTranscript(
  videoId: string,
  language: string
): Promise<{ transcript: string; sourceTrack?: TranscriptTrack } | null> {
  const attempts: TranscriptAttempt[] = [];

  const playerTracks = await fetchTracksFromPlayer(videoId);
  if (playerTracks.length > 0) {
    const prioritizedPlayerTracks = prioritizeTracks(language, playerTracks);
    for (const track of prioritizedPlayerTracks) {
      const transcript = await fetchTranscriptForTrack(videoId, track, attempts);
      if (transcript) {
        return { transcript, sourceTrack: track };
      }
    }
  }

  const tracks = await fetchTrackList(videoId);

  if (tracks.length === 0) {
    // Fallback: try requested language and auto-generated English captions
    const fallbackTracks: TranscriptTrack[] = [
      { langCode: language },
      { langCode: `${language}-US` },
      { langCode: 'en' },
      { langCode: 'en-US' },
      { langCode: language, kind: 'asr' },
      { langCode: 'en', kind: 'asr' },
    ];

    for (const track of fallbackTracks) {
      const transcript = await fetchTranscriptForTrack(videoId, track, attempts);
      if (transcript) {
        return { transcript, sourceTrack: track };
      }
    }

    if (attempts.length > 0) {
      throw { type: 'attempts', attempts };
    }

    return null;
  }

  const prioritizedTracks = prioritizeTracks(language, tracks);
  for (const track of prioritizedTracks) {
    const transcript = await fetchTranscriptForTrack(videoId, track, attempts);
    if (transcript) {
      return { transcript, sourceTrack: track };
    }
  }

  if (attempts.length > 0) {
    throw { type: 'attempts', attempts };
  }

  return null;
}

async function fetchTranscriptWithLibrary(
  videoId: string,
  language: string
): Promise<{ transcript: string; sourceTrack?: TranscriptTrack } | null> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: language,
    });

    if (!segments || segments.length === 0) {
      return null;
    }

    const text = segments
      .map((segment) => decodeHtmlEntities(segment.text ?? ''))
      .filter(Boolean)
      .join('\n');

    if (!text) {
      return null;
    }

    return {
      transcript: text,
      sourceTrack: {
        langCode: language,
        kind: 'library',
        name: 'youtube-transcript',
      },
    };
  } catch (error) {
    return null;
  }
}

async function fetchTranscriptViaProxy(
  videoId: string,
  language: string
): Promise<{ transcript: string; sourceTrack?: TranscriptTrack } | null> {
  const url = new URL('https://youtubetranscript.com/');
  url.searchParams.set('server_vid2', videoId);
  url.searchParams.set('lang', language);
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        ...REQUEST_HEADERS,
        Accept: 'application/json, text/plain, */*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') ?? '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      const jsonMatch = text.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[1]);
        } catch {
          data = null;
        }
      }
    }

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const text = data
      .map((segment: { text?: string }) => decodeHtmlEntities(segment?.text ?? ''))
      .filter(Boolean)
      .join('\n');

    if (!text) {
      return null;
    }

    return {
      transcript: text,
      sourceTrack: {
        langCode: language,
        kind: 'proxy',
        name: 'youtubetranscript.com',
      },
    };
  } catch {
    return null;
  }
}

async function fetchTracksFromPlayer(videoId: string): Promise<TranscriptTrack[]> {
  try {
    const info = await ytdl.getInfo(videoId);
    const captionTracks: any[] =
      info?.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

    if (!captionTracks.length) {
      return [];
    }

    return captionTracks.map((track) => ({
      langCode: track?.languageCode ?? '',
      kind: track?.kind,
      name: track?.name?.simpleText,
      langOriginal: track?.languageName?.simpleText ?? track?.name?.simpleText,
      langDefault: Boolean(track?.isDefault),
      vssId: track?.vssId,
      baseUrl: track?.baseUrl,
      isPlayerTrack: true,
    })) as TranscriptTrack[];
  } catch (error) {
    console.warn('Falling back to timedtext list: unable to fetch player captions.', error);
    return [];
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as TranscriptRequestBody | null;

  if (!body?.url) {
    return NextResponse.json(
      { error: 'A valid YouTube URL is required.' },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(body.url);
  if (!videoId) {
    return NextResponse.json(
      { error: 'Could not parse a YouTube video ID from the provided URL.' },
      { status: 400 }
    );
  }

  const language = body.language ?? 'en';

  try {
    // First, try the library helper (often bypasses bot protection)
    const libraryFirst = await fetchTranscriptWithLibrary(videoId, language);
    if (libraryFirst) {
      return NextResponse.json({
        transcript: libraryFirst.transcript,
        videoId,
        track: libraryFirst.sourceTrack,
        fallback: 'library',
      });
    }

    // Then try the proxy service before hitting YouTube directly
    const proxyFirst = await fetchTranscriptViaProxy(videoId, language);
    if (proxyFirst) {
      return NextResponse.json({
        transcript: proxyFirst.transcript,
        videoId,
        track: proxyFirst.sourceTrack,
        fallback: 'proxy',
      });
    }

    const result = await fetchTranscript(videoId, language);
    if (!result) {
      const fallbackProxy = await fetchTranscriptViaProxy(videoId, language);
      if (fallbackProxy) {
        return NextResponse.json({
          transcript: fallbackProxy.transcript,
          videoId,
          track: fallbackProxy.sourceTrack,
          fallback: 'proxy',
        });
      }

      return NextResponse.json(
        {
          error:
            'Transcript could not be retrieved. It may be unavailable or restricted for this video.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transcript: result.transcript,
      videoId,
      track: result.sourceTrack,
    });
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'type' in error &&
      (error as { type: string }).type === 'attempts'
    ) {
      const attempts = (error as { attempts?: TranscriptAttempt[] }).attempts || [];
      const fallback = await fetchTranscriptWithLibrary(videoId, language);
      if (fallback) {
        return NextResponse.json({
          transcript: fallback.transcript,
          videoId,
          track: fallback.sourceTrack,
          attempts,
          fallback: 'library',
        });
      }

      const fallbackProxy = await fetchTranscriptViaProxy(videoId, language);
      if (fallbackProxy) {
        return NextResponse.json({
          transcript: fallbackProxy.transcript,
          videoId,
          track: fallbackProxy.sourceTrack,
          attempts,
          fallback: 'proxy',
        });
      }

      return NextResponse.json(
        {
          error:
            'Transcript could not be retrieved. YouTube returned an error for every available caption track.',
          attempts,
        },
        { status: 502 }
      );
    }

    const fallback = await fetchTranscriptWithLibrary(videoId, language);
    if (fallback) {
      return NextResponse.json({
        transcript: fallback.transcript,
        videoId,
        track: fallback.sourceTrack,
        fallback: 'library',
      });
    }

    const fallbackProxy = await fetchTranscriptViaProxy(videoId, language);
    if (fallbackProxy) {
      return NextResponse.json({
        transcript: fallbackProxy.transcript,
        videoId,
        track: fallbackProxy.sourceTrack,
        fallback: 'proxy',
      });
    }

    return NextResponse.json(
      {
        error: 'Unexpected error while retrieving the transcript.',
        details: error instanceof Error ? error.message : String(error ?? 'unknown error'),
      },
      { status: 502 }
    );
  }
}
