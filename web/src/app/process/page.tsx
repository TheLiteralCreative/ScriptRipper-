'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Download, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analysisApi, api } from '@/lib/api';

interface TaskStatus {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: string;
  error?: string;
  tokens?: { input: number; output: number };
  cost?: number;
}

export default function ProcessPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check authentication and load configuration from sessionStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const transcript = sessionStorage.getItem('transcript');
      const selectedPromptsJson = sessionStorage.getItem('selectedPrompts');

      if (!transcript || !selectedPromptsJson) {
        router.push('/');
        return;
      }

      setCheckingAuth(false);

      const selectedPrompts = JSON.parse(selectedPromptsJson);
      const initialTasks: TaskStatus[] = selectedPrompts.map(
        (name: string) => ({
          name,
          status: 'pending' as const,
        })
      );

      // Add custom prompt if exists
      const customPrompt = sessionStorage.getItem('customPrompt');
      if (customPrompt && customPrompt.trim()) {
        initialTasks.push({
          name: 'Custom Analysis',
          status: 'pending' as const,
        });
      }

      setTasks(initialTasks);
      startProcessing(initialTasks, transcript);
    }
  }, [router]);

  const startProcessing = async (
    initialTasks: TaskStatus[],
    transcript: string
  ) => {
    setIsProcessing(true);

    const transcriptType = sessionStorage.getItem('transcriptType') as 'meetings' | 'presentations';
    const customPromptText = sessionStorage.getItem('customPrompt');

    try {
      // Fetch prompts from API
      const promptsResponse = await api.get('/prompts');
      const promptsData = promptsResponse.data;
      const allPrompts = transcriptType === 'meetings' ? promptsData.meetings : promptsData.presentations;

      // Build tasks array for batch API
      const batchTasks = initialTasks.map((task) => {
        if (task.name === 'Custom Analysis' && customPromptText) {
          return {
            task_name: 'Custom Analysis',
            prompt: customPromptText,
          };
        } else {
          const promptObj = allPrompts.find((p: any) => p.task_name === task.name);
          if (!promptObj) {
            throw new Error(`Prompt not found for task: ${task.name}`);
          }
          return {
            task_name: task.name,
            prompt: promptObj.prompt,
          };
        }
      });

      // Simulate progressive UI updates
      const updateInterval = setInterval(() => {
        setTasks((prev) => {
          const nextPending = prev.findIndex((t) => t.status === 'pending');
          if (nextPending !== -1) {
            return prev.map((task, idx) =>
              idx === nextPending ? { ...task, status: 'processing' as const } : task
            );
          }
          return prev;
        });
      }, 500);

      // Call batch API
      const batchResponse = await analysisApi.analyzeBatch({
        transcript,
        transcript_type: transcriptType,
        tasks: batchTasks,
      });

      clearInterval(updateInterval);

      // Update all tasks with results
      const results: Array<{ name: string; result: string }> = [];

      setTasks((prev) =>
        prev.map((task, idx) => {
          const taskResult = batchResponse.results[idx];
          results.push({ name: task.name, result: taskResult.result });

          return {
            ...task,
            status: 'completed' as const,
            result: taskResult.result,
            tokens: {
              input: taskResult.input_tokens,
              output: taskResult.output_tokens,
            },
            cost: taskResult.cost,
          };
        })
      );

      setIsProcessing(false);
      setAllComplete(true);

      // Store results
      sessionStorage.setItem('results', JSON.stringify(results));
    } catch (error: any) {
      console.error('Batch analysis failed:', error);

      // Mark all pending/processing tasks as error
      setTasks((prev) =>
        prev.map((task) =>
          task.status === 'pending' || task.status === 'processing'
            ? {
                ...task,
                status: 'error' as const,
                error:
                  error.response?.data?.error?.message ||
                  error.message ||
                  'Analysis failed',
              }
            : task
        )
      );

      setIsProcessing(false);
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleDownload = () => {
    router.push('/download');
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            {allComplete ? (
              <CheckCircle2 className="h-10 w-10 text-gray-900" />
            ) : (
              <Loader2 className="h-10 w-10 animate-spin text-gray-900" />
            )}
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-gray-900">
            {allComplete ? 'Analysis Complete!' : 'Processing Your Transcript'}
          </h1>
          <p className="text-lg font-light text-gray-600">
            {allComplete
              ? 'All tasks completed successfully'
              : `Analyzing ${tasks.length} tasks...`}
          </p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Overall Progress
              </CardTitle>
              <CardDescription className="text-base">
                {completedCount} of {tasks.length} tasks completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Individual Tasks */}
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                  className={`border-gray-200 shadow-sm transition-all ${
                    task.status === 'error' ? 'border-red-300 bg-red-50/50' : ''
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="flex-shrink-0">
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-gray-900" />
                      ) : task.status === 'processing' ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-900" />
                      ) : task.status === 'error' ? (
                        <div className="h-6 w-6 rounded-full border-2 border-red-500 bg-white flex items-center justify-center text-red-500 text-xs font-bold">
                          ✕
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-500">
                        {task.status === 'completed'
                          ? `Complete${task.cost ? ` • $${task.cost.toFixed(4)} • ${task.tokens?.input}/${task.tokens?.output} tokens` : ''}`
                          : task.status === 'processing'
                            ? 'Processing...'
                            : task.status === 'error'
                              ? `Error: ${task.error}`
                              : 'Waiting...'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Download Button */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12 flex justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleDownload}
                size="lg"
                className="gap-2 bg-gray-900 text-white hover:bg-gray-800 px-8"
              >
                <Download className="h-5 w-5" />
                Download Results
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
