'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analysisApi } from '@/lib/api';
import meetingsPrompts from '../configure/prompts/meetings_prompts.json';
import presentationsPrompts from '../configure/prompts/presentations_prompts.json';

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

  useEffect(() => {
    // Load configuration from sessionStorage
    if (typeof window !== 'undefined') {
      const transcript = sessionStorage.getItem('transcript');
      const selectedPromptsJson = sessionStorage.getItem('selectedPrompts');

      if (!transcript || !selectedPromptsJson) {
        router.push('/');
        return;
      }

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

    // Get all prompts for the selected type
    const allPrompts = transcriptType === 'meetings' ? meetingsPrompts : presentationsPrompts;

    const results: Array<{ name: string; result: string }> = [];

    // Process each task sequentially
    for (let i = 0; i < initialTasks.length; i++) {
      const taskName = initialTasks[i].name;

      // Update to processing
      setTasks((prev) =>
        prev.map((task, idx) =>
          idx === i ? { ...task, status: 'processing' } : task
        )
      );

      try {
        let result: string;
        let inputTokens: number;
        let outputTokens: number;
        let cost: number;

        // Check if this is the custom prompt
        if (taskName === 'Custom Analysis' && customPromptText) {
          const response = await analysisApi.analyzeCustom({
            transcript,
            task_name: 'Custom Analysis',
            prompt: customPromptText,
          });

          result = response.result;
          inputTokens = response.input_tokens;
          outputTokens = response.output_tokens;
          cost = response.cost;
        } else {
          // Find the prompt for this task
          const promptObj = allPrompts.find((p: any) => p.task_name === taskName);

          if (!promptObj) {
            throw new Error(`Prompt not found for task: ${taskName}`);
          }

          const response = await analysisApi.analyzeCustom({
            transcript,
            task_name: taskName,
            prompt: promptObj.prompt,
          });

          result = response.result;
          inputTokens = response.input_tokens;
          outputTokens = response.output_tokens;
          cost = response.cost;
        }

        // Update to completed
        setTasks((prev) =>
          prev.map((task, idx) =>
            idx === i
              ? {
                  ...task,
                  status: 'completed',
                  result,
                  tokens: { input: inputTokens, output: outputTokens },
                  cost,
                }
              : task
          )
        );

        results.push({ name: taskName, result });

      } catch (error: any) {
        console.error(`Task failed: ${taskName}`, error);

        // Update to error
        setTasks((prev) =>
          prev.map((task, idx) =>
            idx === i
              ? {
                  ...task,
                  status: 'error',
                  error: error.response?.data?.detail?.message || error.message || 'Analysis failed',
                }
              : task
          )
        );

        results.push({
          name: taskName,
          result: `Error: ${error.response?.data?.detail?.message || error.message}`,
        });
      }
    }

    setIsProcessing(false);
    setAllComplete(true);

    // Store results
    sessionStorage.setItem('results', JSON.stringify(results));
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleDownload = () => {
    router.push('/download');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl pt-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Processing Your Transcript
          </h1>
          <p className="text-gray-600">
            {allComplete
              ? 'All tasks completed!'
              : `Analyzing ${tasks.length} tasks...`}
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {completedCount} of {tasks.length} tasks completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Individual Tasks */}
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <Card key={index} className={task.status === 'error' ? 'border-red-200' : ''}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex-shrink-0">
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : task.status === 'processing' ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : task.status === 'error' ? (
                    <div className="h-6 w-6 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center text-red-500 text-xs font-bold">✕</div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.name}</h3>
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
          ))}
        </div>

        {/* Download Button */}
        {allComplete && (
          <div className="mt-8 flex justify-center">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
