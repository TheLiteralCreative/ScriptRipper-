'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
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

  const handleContinue = () => {
    if (transcript.trim()) {
      // Store transcript in sessionStorage to pass to next page
      sessionStorage.setItem('transcript', transcript);
      router.push('/configure');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      <div className="mx-auto max-w-4xl p-4 pt-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-gray-900">
            ScriptRipper
          </h1>
          <p className="text-xl text-gray-600">
            Transform transcripts into actionable insights
          </p>
        </div>

        {/* Upload Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Your Transcript</CardTitle>
            <CardDescription>
              Drag and drop your transcript file or paste the text directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-primary hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-gray-900">
                    {fileName}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-2 text-sm font-medium text-gray-900">
                    {isDragActive
                      ? 'Drop your file here'
                      : 'Drop your transcript file here'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports .txt, .json, .srt, .vtt files
                  </p>
                </>
              )}
            </div>

            {/* Or Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label
                htmlFor="transcript"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Paste your transcript
              </label>
              <textarea
                id="transcript"
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Speaker 1: Welcome to the meeting...
Speaker 2: Thanks for having me..."
              />
              <p className="mt-2 text-xs text-gray-500">
                {transcript.length} characters
              </p>
            </div>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              disabled={!transcript.trim()}
              size="lg"
              className="w-full"
            >
              Continue to Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Your transcript is processed securely and never stored permanently
        </p>
      </div>
    </div>
  );
}
