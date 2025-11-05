'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';

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
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check authentication and transcript
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const transcript = sessionStorage.getItem('transcript');
      if (!transcript) {
        router.push('/');
        return;
      }

      setCheckingAuth(false);
    }
  }, [router]);

  // Fetch prompts when transcript type changes
  useEffect(() => {
    const fetchPrompts = async () => {
      if (!transcriptType) {
        setAvailablePrompts([]);
        return;
      }

      try {
        setLoadingPrompts(true);
        const response = await api.get('/prompts');
        const promptsData = response.data;

        const prompts =
          transcriptType === 'meetings'
            ? promptsData.meetings
            : promptsData.presentations;

        setAvailablePrompts(prompts);
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
        setAvailablePrompts([]);
      } finally {
        setLoadingPrompts(false);
      }
    };

    fetchPrompts();
  }, [transcriptType]);

  const togglePrompt = (taskName: string) => {
    const newSelected = new Set(selectedPrompts);
    if (newSelected.has(taskName)) {
      newSelected.delete(taskName);
    } else {
      // Enforce 5 prompt max (including custom)
      const customCount = customPrompt.trim() ? 1 : 0;
      if (newSelected.size + customCount >= 5) {
        alert('Maximum 5 prompts allowed per rip (including custom prompt)');
        return;
      }
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

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-8 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            <Zap className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            Configure Your Analysis
          </h1>
          <p className="text-lg font-light text-gray-600">
            Choose your transcript type and select the analysis tasks
          </p>
        </motion.div>

        {/* Transcript Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Step 1: Choose Transcript Type
              </CardTitle>
              <CardDescription className="text-base">
                Select whether this is a multi-speaker meeting or single-speaker
                presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTranscriptType('meetings')}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    transcriptType === 'meetings'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Meeting</h3>
                    {transcriptType === 'meetings' && (
                      <Check className="h-5 w-5 text-gray-900" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Multi-speaker conversations with decisions, action items, and
                    discussions
                  </p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTranscriptType('presentations')}
                  className={`rounded-xl border-2 p-6 text-left transition-all ${
                    transcriptType === 'presentations'
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Presentation</h3>
                    {transcriptType === 'presentations' && (
                      <Check className="h-5 w-5 text-gray-900" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Single-speaker content like tutorials, talks, or educational
                    videos
                  </p>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prompt Selection */}
        {transcriptType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="mb-8 border-gray-200 shadow-sm">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                  Step 2: Select Analysis Tasks
                </CardTitle>
                <CardDescription className="text-base">
                  Choose which insights you want to extract (select multiple)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {availablePrompts.map((prompt, index) => (
                    <motion.button
                      key={prompt.task_name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePrompt(prompt.task_name)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        selectedPrompts.has(prompt.task_name)
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {prompt.task_name}
                        </span>
                        {selectedPrompts.has(prompt.task_name) && (
                          <Check className="h-4 w-4 flex-shrink-0 text-gray-900" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

              {/* Custom Prompt */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCustom(!showCustom)}
                  className="w-full"
                  disabled={!showCustom && selectedPrompts.size >= 5}
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
          </motion.div>
        )}

        {/* Continue Button */}
        {transcriptType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-end gap-4 items-center"
          >
            <p className="text-sm text-gray-500">
              {selectedPrompts.size + (customPrompt.trim() ? 1 : 0)} of 5 prompts selected
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleContinue}
                disabled={!transcriptType || selectedPrompts.size === 0}
                size="lg"
                className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
              >
                Rip This Script! →
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
