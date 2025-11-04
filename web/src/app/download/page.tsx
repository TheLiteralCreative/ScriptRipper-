'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileText, Home, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resultsJson = sessionStorage.getItem('results');
      if (!resultsJson) {
        router.push('/');
        return;
      }
      setResults(JSON.parse(resultsJson));
    }
  }, [router]);

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
    saveAs(content, `scriptripper_results_${timestamp}.zip`);
  };

  const handleNewRip = () => {
    // Clear session storage
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl pt-8">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Your Script Has Been Ripped!
          </h1>
          <p className="text-gray-600">
            All {results.length} analysis tasks completed successfully
          </p>
        </div>

        {/* Download Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Download Your Results</CardTitle>
            <CardDescription>
              Get your analyzed transcript in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File List */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-medium text-gray-900">
                Your .zip contains:
              </h3>
              <ul className="space-y-2">
                {results.map((result, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{result.name}</span>
                    <span className="text-gray-400">(.md, .txt, .json)</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm border-t border-gray-200 pt-2 mt-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700">summary.json</span>
                  <span className="text-gray-400">(all results combined)</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-gray-500">
                Total files: {results.length * 3 + 1} organized in folders by format
              </p>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleDownloadZip}
              size="lg"
              className="w-full gap-2"
            >
              <Download className="h-5 w-5" />
              Download All Files (.zip)
            </Button>

            <p className="text-center text-xs text-gray-500">
              Files will be saved to your Downloads folder
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button onClick={handleNewRip} variant="outline" size="lg">
            <Home className="mr-2 h-5 w-5" />
            Rip Another Script
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#" onClick={(e) => e.preventDefault()}>
              View Usage Stats
            </a>
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-blue-900">
                Need more rips?
              </h3>
              <p className="mb-4 text-sm text-blue-800">
                Free users get 1 rip per day. Upgrade to Pro for unlimited
                access!
              </p>
              <Button variant="default">Upgrade to Pro - $5/month</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
