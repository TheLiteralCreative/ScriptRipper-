'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Home, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Result {
  name: string;
  result: string;
}

export default function DownloadPage() {
  const router = useRouter();
  const [results, setResults] = useState<Result[]>([]);
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const resultsJson = sessionStorage.getItem('results');
      if (!resultsJson) {
        router.push('/');
        return;
      }
      setResults(JSON.parse(resultsJson));

      // Get original filename if available
      const fileName = sessionStorage.getItem('originalFileName') || '';
      setOriginalFileName(fileName);

      setCheckingAuth(false);
    }
  }, [router]);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Create filename with original file name
    const cleanFileName = originalFileName
      ? originalFileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
      : 'transcript';
    const zipFileName = `scriptripper_${cleanFileName}_${timestamp}.zip`;

    // Create a folder for each format
    const markdownFolder = zip.folder('markdown');
    const textFolder = zip.folder('text');
    const jsonFolder = zip.folder('json');

    // Add each result in all formats
    results.forEach((result) => {
      const fileName = result.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

      // Markdown format (original)
      markdownFolder?.file(`${fileName}.md`, result.result);

      // Plain text format (strip markdown formatting)
      const plainText = result.result
        .replace(/^#+\s+/gm, '') // Remove headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.*?)\*/g, '$1') // Remove italic
        .replace(/`(.*?)`/g, '$1') // Remove code blocks
        .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Remove links
      textFolder?.file(`${fileName}.txt`, plainText);

      // JSON format (structured)
      const jsonData = {
        task_name: result.name,
        content: result.result,
        generated_at: new Date().toISOString(),
        format: 'markdown',
      };
      jsonFolder?.file(`${fileName}.json`, JSON.stringify(jsonData, null, 2));
    });

    // Create a summary JSON with all results
    const summaryData = {
      generated_at: new Date().toISOString(),
      total_tasks: results.length,
      results: results.map((r) => ({
        task_name: r.name,
        content: r.result,
      })),
    };
    zip.file('summary.json', JSON.stringify(summaryData, null, 2));

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipFileName);
  };

  const handleReturnHome = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/');
  };

  // Show nothing while checking auth (will redirect if not authenticated)
  if (checkingAuth) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div className="h-[600px] w-[600px] rounded-full bg-gradient-to-br from-gray-100 via-gray-50 to-transparent blur-3xl opacity-60" />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
            className="mb-6 flex justify-center"
          >
            <div className="rounded-full bg-gray-100 p-6">
              <CheckCircle2 className="h-16 w-16 text-gray-900" />
            </div>
          </motion.div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            Your Script Has Been Ripped!
          </h1>
          <p className="text-lg font-light text-gray-600">
            All {results.length} analysis tasks completed successfully
          </p>
        </motion.div>

        {/* Download Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Download Your Results
              </CardTitle>
              <CardDescription className="text-base">
                Get your analyzed transcript in multiple formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File List */}
              <div className="rounded-xl bg-gray-50 p-6">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Your .zip contains:
                </h3>
                <ul className="space-y-2.5">
                  {results.map((result, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-900">{result.name}</span>
                      <span className="text-gray-400 text-xs">(.md, .txt, .json)</span>
                    </motion.li>
                  ))}
                  <li className="flex items-center gap-2 text-sm border-t border-gray-200 pt-3 mt-3">
                    <Sparkles className="h-4 w-4 flex-shrink-0 text-gray-900" />
                    <span className="font-medium text-gray-900">summary.json</span>
                    <span className="text-gray-400 text-xs">(all results combined)</span>
                  </li>
                </ul>
                <p className="mt-4 text-xs text-gray-500">
                  Total files: {results.length * 3 + 1} organized in folders by format
                </p>
              </div>

              {/* Download Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleDownloadZip}
                  size="lg"
                  className="w-full gap-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  <Download className="h-5 w-5" />
                  Download All Files (.zip)
                </Button>
              </motion.div>

              <p className="text-center text-xs text-gray-400">
                Files will be saved to your Downloads folder
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleReturnHome}
              variant="outline"
              size="lg"
              className="gap-2 border-gray-300"
            >
              <Home className="h-5 w-5" />
              Return to Home
            </Button>
          </motion.div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="mt-12 border-gray-200 bg-gray-50">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Need more rips?
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  Free users get 1 rip per day. Upgrade to Pro for unlimited access!
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="bg-gray-900 text-white hover:bg-gray-800">
                    Upgrade to Pro - $5/month
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
