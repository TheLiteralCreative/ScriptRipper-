'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Import the prompts data
import meetingsPrompts from './prompts/meetings_prompts.json';
import presentationsPrompts from './prompts/presentations_prompts.json';

type TranscriptType = 'meetings' | 'presentations' | null;

interface Prompt {
  task_name: string;
  prompt: string;
}

export default function ConfigurePage() {
  const router = useRouter();
  const [transcriptType, setTranscriptType] = useState<TranscriptType>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(
    new Set()
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Check if transcript exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const transcript = sessionStorage.getItem('transcript');
      if (!transcript) {
        router.push('/');
      }
    }
  }, [router]);

  const availablePrompts: Prompt[] =
    transcriptType === 'meetings'
      ? (meetingsPrompts as Prompt[])
      : transcriptType === 'presentations'
        ? (presentationsPrompts as Prompt[])
        : [];

  const togglePrompt = (taskName: string) => {
    const newSelected = new Set(selectedPrompts);
    if (newSelected.has(taskName)) {
      newSelected.delete(taskName);
    } else {
      newSelected.add(taskName);
    }
    setSelectedPrompts(newSelected);
  };

  const handleContinue = () => {
    if (!transcriptType || selectedPrompts.size === 0) return;

    // Store configuration
    sessionStorage.setItem('transcriptType', transcriptType);
    sessionStorage.setItem(
      'selectedPrompts',
      JSON.stringify(Array.from(selectedPrompts))
    );
    if (customPrompt.trim()) {
      sessionStorage.setItem('customPrompt', customPrompt);
    }

    router.push('/process');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-5xl pt-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Configure Your Analysis
          </h1>
          <p className="text-gray-600">
            Choose your transcript type and select the analysis tasks
          </p>
        </div>

        {/* Transcript Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Step 1: Choose Transcript Type</CardTitle>
            <CardDescription>
              Select whether this is a multi-speaker meeting or single-speaker
              presentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => setTranscriptType('meetings')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  transcriptType === 'meetings'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold">Meeting</h3>
                  {transcriptType === 'meetings' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Multi-speaker conversations with decisions, action items, and
                  discussions
                </p>
              </button>

              <button
                onClick={() => setTranscriptType('presentations')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  transcriptType === 'presentations'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-semibold">Presentation</h3>
                  {transcriptType === 'presentations' && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Single-speaker content like tutorials, talks, or educational
                  videos
                </p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Selection */}
        {transcriptType && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Step 2: Select Analysis Tasks</CardTitle>
              <CardDescription>
                Choose which insights you want to extract (select multiple)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {availablePrompts.map((prompt) => (
                  <button
                    key={prompt.task_name}
                    onClick={() => togglePrompt(prompt.task_name)}
                    className={`rounded-lg border-2 p-4 text-left transition-all ${
                      selectedPrompts.has(prompt.task_name)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm font-medium">
                        {prompt.task_name}
                      </span>
                      {selectedPrompts.has(prompt.task_name) && (
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Prompt */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full"
                >
                  {showCustom ? 'Hide' : 'Add'} Custom Prompt
                </Button>

                {showCustom && (
                  <div className="mt-4">
                    <label
                      htmlFor="custom-prompt"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Custom Analysis Task
                    </label>
                    <textarea
                      id="custom-prompt"
                      rows={4}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Describe what you want to extract from the transcript..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            disabled={!transcriptType || selectedPrompts.size === 0}
            size="lg"
          >
            Rip This Script! (
            {selectedPrompts.size + (customPrompt.trim() ? 1 : 0)} tasks
            selected)
          </Button>
        </div>
      </div>
    </div>
  );
}
