'use client';

import { useState, useEffect, type RefCallback, type AnimationEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';
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
import { extractTextFromFile } from '@/lib/parsers';

// Maximum allowed transcript length (matches backend setting)
const MAX_TRANSCRIPT_LENGTH = 500000; // 500K characters (~125K tokens)

export default function Home() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/vtt': ['.vtt'],
      'application/x-subrip': ['.srt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFileName(file.name);

        try {
          // Use the parser utility to extract text from any supported file type
          const text = await extractTextFromFile(file);
          setTranscript(text);

          // Validate length after setting
          if (text.length > MAX_TRANSCRIPT_LENGTH) {
            setValidationError(
              `Transcript is too long (${text.length.toLocaleString()} characters). Maximum allowed is ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters.`
            );
          } else {
            setValidationError(null);
          }
        } catch (error) {
          console.error('Error extracting text from file:', error);
          setValidationError(
            `Failed to extract text from file: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
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
      // Validate length before continuing
      if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
        setValidationError(
          `Transcript is too long (${transcript.length.toLocaleString()} characters). Maximum allowed is ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters.`
        );
        return;
      }

      // Store transcript and filename in sessionStorage to pass to next page
      sessionStorage.setItem('transcript', transcript);
      if (fileName) {
        sessionStorage.setItem('originalFileName', fileName);
      }
      router.push('/configure');
    }
  };

  // Handle transcript change and validate
  const handleTranscriptChange = (value: string) => {
    setTranscript(value);

    // Validate length
    if (value.length > MAX_TRANSCRIPT_LENGTH) {
      setValidationError(
        `Transcript is too long (${value.length.toLocaleString()} characters). Maximum allowed is ${MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters.`
      );
    } else {
      setValidationError(null);
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
                      Supports .txt, .md, .json, .srt, .vtt, .pdf, .doc, .docx files
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
                  onChange={(e) => handleTranscriptChange(e.target.value)}
                  className={`w-full rounded-xl border p-4 text-sm leading-relaxed transition-all focus:outline-none focus:ring-2 ${
                    validationError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-gray-300 focus:border-gray-900 focus:ring-gray-900/10'
                  }`}
                  placeholder="Speaker 1: Welcome to the meeting...
Speaker 2: Thanks for having me..."
                />
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Maximum {MAX_TRANSCRIPT_LENGTH.toLocaleString()} characters
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      validationError
                        ? 'text-red-600'
                        : transcript.length > MAX_TRANSCRIPT_LENGTH * 0.9
                          ? 'text-amber-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {transcript.length.toLocaleString()} / {MAX_TRANSCRIPT_LENGTH.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-900 mb-1">
                        Transcript Too Large
                      </h4>
                      <p className="text-sm text-red-700">{validationError}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleContinue}
                  disabled={!transcript.trim() || !!validationError}
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
