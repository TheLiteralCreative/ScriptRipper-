'use client';

import { useState, useEffect, type RefCallback, type AnimationEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Navbar } from '@/components/navbar';

export default function Home() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [youtubeMessage, setYoutubeMessage] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'text/vtt': ['.vtt'],
      'application/x-subrip': ['.srt'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);
        const text = await file.text();
        setTranscript(text);
      }
    },
  });

  // Check authentication on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      setCheckingAuth(false);
    }
  }, [router]);

  const handleContinue = () => {
    if (transcript.trim()) {
      // Store transcript and filename in sessionStorage to pass to next page
      sessionStorage.setItem('transcript', transcript);
      if (fileName) {
        sessionStorage.setItem('originalFileName', fileName);
      }
      router.push('/configure');
    }
  };

  const copyTranscriptToClipboard = async (text: string): Promise<boolean> => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Continue to fallback
      }
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }

    document.body.removeChild(textArea);
    return copied;
  };

  const handleFetchTranscript = async () => {
    const trimmedUrl = youtubeUrl.trim();
    if (!trimmedUrl) {
      setYoutubeError('Enter a YouTube video URL to continue.');
      return;
    }

    setIsFetchingTranscript(true);
    setYoutubeMessage(null);
    setYoutubeError(null);

    try {
      const response = await fetch('/api/youtube-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmedUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data?.error || 'Failed to retrieve transcript.';

        if (Array.isArray(data?.attempts) && data.attempts.length > 0) {
          const first = data.attempts[0];
          const parts: string[] = [];
          if (first.track?.langCode) {
            parts.push(`lang=${first.track.langCode}`);
          }
          if (first.track?.kind) {
            parts.push(`kind=${first.track.kind}`);
          }
          if (first.status) {
            parts.push(`status=${first.status}`);
          }
          if (first.message) {
            parts.push(first.message);
          }
          if (parts.length > 0) {
            errorMessage += ` (${parts.join(', ')})`;
          }
        } else if (data?.details) {
          errorMessage += ` (${data.details})`;
        }

        throw new Error(errorMessage);
      }

      if (!data?.transcript) {
        throw new Error('Transcript returned empty. Try a different video.');
      }

      const transcriptText = String(data.transcript);
      setTranscript(transcriptText);
      setFileName('YouTube transcript');

      const copied = await copyTranscriptToClipboard(transcriptText);
      const trackDetails: string[] = [];
      if (data.track?.langCode) {
        trackDetails.push(`lang=${data.track.langCode}`);
      }
      if (data.track?.kind === 'asr') {
        trackDetails.push('auto-generated');
      } else if (data.track?.kind === 'library') {
        trackDetails.push('library fallback');
      } else if (data.track?.kind === 'proxy') {
        trackDetails.push('proxy fallback');
      }
      if (data.fallback === 'proxy' && !trackDetails.includes('proxy fallback')) {
        trackDetails.push('proxy fallback');
      } else if (data.fallback === 'library' && !trackDetails.includes('library fallback')) {
        trackDetails.push('library fallback');
      }
      const trackLabel = trackDetails.length > 0 ? ` (${trackDetails.join(', ')})` : '';

      setYoutubeMessage(
        (copied
          ? 'Transcript copied to your clipboard and loaded below.'
          : 'Transcript loaded below. Copy it manually if needed.') + trackLabel
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to retrieve transcript.';
      setYoutubeError(message);
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  // Show nothing while checking auth (will redirect if not authenticated)
  if (checkingAuth) {
    return null;
  }

  const dropzoneRoot = getRootProps();
  const {
    ref: dropzoneRef,
    onAnimationStart: _ignoredOnAnimationStart,
    onAnimationEnd: _ignoredOnAnimationEnd,
    className: _ignoredDropzoneClassName,
    ...dropzoneRootProps
  } = dropzoneRoot as unknown as {
    ref: RefCallback<HTMLDivElement>;
    onAnimationStart?: AnimationEventHandler<HTMLDivElement>;
    onAnimationEnd?: AnimationEventHandler<HTMLDivElement>;
    className?: string;
    [key: string]: unknown;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="mb-4 text-6xl font-bold tracking-tight text-gray-900">
            ScriptRipper
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-gray-600">
            Transform transcripts into actionable insights with AI-powered analysis
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-12 border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Upload Your Transcript
              </CardTitle>
              <CardDescription className="text-base">
                Drag and drop your transcript file or paste the text directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Dropzone */}
              <motion.div
                {...dropzoneRootProps}
                ref={dropzoneRef}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`group cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-all ${
                  isDragActive
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload
                  className={`mx-auto mb-4 h-12 w-12 transition-colors ${
                    isDragActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                {fileName ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5 text-gray-900" />
                    <p className="text-sm font-medium text-gray-900">
                      {fileName}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <p className="mb-2 text-base font-medium text-gray-900">
                      {isDragActive
                        ? 'Drop your file here'
                        : 'Drop your transcript file here'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports .txt, .json, .srt, .vtt files
                    </p>
                  </>
                )}
              </motion.div>

              {/* Or Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-400 font-medium">OR</span>
                </div>
              </div>

              {/* Fetch from YouTube */}
              <div className="space-y-3">
                <label
                  htmlFor="youtubeUrl"
                  className="block text-sm font-medium text-gray-900"
                >
                  Paste a YouTube URL to grab its transcript
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id="youtubeUrl"
                    type="url"
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchTranscript}
                    disabled={isFetchingTranscript}
                    className="sm:w-auto"
                  >
                    {isFetchingTranscript ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      'Fetch & Copy'
                    )}
                  </Button>
                </div>
                {youtubeMessage && (
                  <p className="text-sm text-emerald-600">{youtubeMessage}</p>
                )}
                {youtubeError && (
                  <p className="text-sm text-red-500">{youtubeError}</p>
                )}
              </div>

              {/* Text Area */}
              <div>
                <label
                  htmlFor="transcript"
                  className="mb-3 block text-sm font-medium text-gray-900"
                >
                  Paste your transcript
                </label>
                <textarea
                  id="transcript"
                  rows={10}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4 text-sm leading-relaxed transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Speaker 1: Welcome to the meeting...
Speaker 2: Thanks for having me..."
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {transcript.length.toLocaleString()} characters
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleContinue}
                  disabled={!transcript.trim()}
                  size="lg"
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all"
                >
                  Continue to Configuration →
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-gray-400"
        >
          Your transcript is processed securely and never stored permanently
        </motion.p>
      </div>
    </div>
  );
}
