'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, Zap, Users, FileText, Sparkles } from 'lucide-react';
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

interface Prompt {
  task_name: string;
  description: string;
  prompt: string;
}

interface TranscriptMetadata {
  participantCount: number;
  participantType: 'solo' | 'interview' | 'group' | 'panel' | 'other';
  customType?: string;
  title: string;
  date: string;
  participants: string[];
}

export default function ConfigurePage() {
  const router = useRouter();

  // Step 1: Participant info
  const [participantCount, setParticipantCount] = useState<number>(1);
  const [participantType, setParticipantType] = useState<'solo' | 'interview' | 'group' | 'panel' | 'other'>('solo');
  const [customType, setCustomType] = useState('');

  // Step 2: Metadata
  const [metadata, setMetadata] = useState<TranscriptMetadata>({
    participantCount: 1,
    participantType: 'solo',
    title: '',
    date: new Date().toISOString().split('T')[0],
    participants: [''],
  });

  // Step 3: Prompts
  const [selectedPrompts, setSelectedPrompts] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [availablePrompts, setAvailablePrompts] = useState<Prompt[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
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

  // Fetch all prompts (unified - no category filter)
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoadingPrompts(true);
        const response = await api.get('/prompts');
        const promptsData = response.data;

        // Combine all prompts from both categories
        const allPrompts = [
          ...(promptsData.meetings || []),
          ...(promptsData.presentations || []),
        ];

        // Remove duplicates based on task_name
        const uniquePrompts = allPrompts.filter(
          (prompt, index, self) =>
            index === self.findIndex((p) => p.task_name === prompt.task_name)
        );

        setAvailablePrompts(uniquePrompts);
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
        setAvailablePrompts([]);
      } finally {
        setLoadingPrompts(false);
      }
    };

    if (currentStep === 3) {
      fetchPrompts();
    }
  }, [currentStep]);

  // Update participant count in metadata when changed
  useEffect(() => {
    const newParticipants = Array(participantCount).fill('').map((_, i) =>
      metadata.participants[i] || ''
    );
    setMetadata(prev => ({
      ...prev,
      participantCount,
      participantType,
      customType,
      participants: newParticipants,
    }));
  }, [participantCount, participantType]);

  const updateParticipant = (index: number, value: string) => {
    const newParticipants = [...metadata.participants];
    newParticipants[index] = value;
    setMetadata(prev => ({ ...prev, participants: newParticipants }));
  };

  const togglePrompt = (taskName: string) => {
    const newSelected = new Set(selectedPrompts);
    if (newSelected.has(taskName)) {
      newSelected.delete(taskName);
    } else {
      const customCount = customPrompt.trim() ? 1 : 0;
      if (newSelected.size + customCount >= 5) {
        alert('Maximum 5 prompts allowed per rip (including custom prompt)');
        return;
      }
      newSelected.add(taskName);
    }
    setSelectedPrompts(newSelected);
  };

  const handleStep1Continue = () => {
    if (participantCount > 0) {
      setCurrentStep(2);
    }
  };

  const handleStep2Continue = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    const hasPrompts = selectedPrompts.size > 0 || customPrompt.trim();
    if (!hasPrompts) return;

    // Store metadata and configuration
    sessionStorage.setItem('metadata', JSON.stringify(metadata));
    sessionStorage.setItem('selectedPrompts', JSON.stringify(Array.from(selectedPrompts)));
    if (customPrompt.trim()) {
      sessionStorage.setItem('customPrompt', customPrompt);
    }

    router.push('/process');
  };

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
          {currentStep === 1 ? (
            <Link href="/">
              <Button variant="ghost" className="mb-8 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleBack}
              variant="ghost"
              className="mb-8 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
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
            Step {currentStep} of 3
          </p>
        </motion.div>

        {/* Progress Indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-20 rounded-full transition-all ${
                step <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Participant Count & Type */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-gray-200 shadow-sm">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-gray-900" />
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Step 1: Participant Information
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Tell us about the speakers or participants in this transcript
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Participant Count and Type - Side by Side */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Number of Participants */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Number of Participants
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={participantCount}
                      onChange={(e) => setParticipantCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      placeholder="e.g., 1, 2, 5..."
                    />
                  </div>

                  {/* Type of Content - Dropdown */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Type of Content
                    </label>
                    <select
                      value={participantType}
                      onChange={(e) => setParticipantType(e.target.value as any)}
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                    >
                      <option value="solo">Solo (single speaker)</option>
                      <option value="interview">Interview (one-on-one)</option>
                      <option value="group">Group (team meeting)</option>
                      <option value="panel">Panel (discussion/roundtable)</option>
                      <option value="other">Other (custom type)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Type Input */}
                {participantType === 'other' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="mb-2 block text-sm font-medium text-gray-900">
                      Specify Content Type
                    </label>
                    <input
                      type="text"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      placeholder="e.g., Podcast, Debate, Workshop..."
                      className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleStep1Continue}
                  disabled={participantCount < 1 || (participantType === 'other' && !customType.trim())}
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Continue to Metadata →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Metadata Form */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-gray-200 shadow-sm">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-gray-900" />
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Step 2: Add Metadata
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Optional but recommended - helps with organization and file naming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Title/Topic
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                    placeholder="e.g., Weekly Team Sync, Product Launch Discussion..."
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Date
                  </label>
                  <input
                    type="date"
                    value={metadata.date}
                    onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                </div>

                {/* Participants */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900">
                    Participant Names
                  </label>
                  <p className="mb-3 text-xs text-gray-500">
                    {participantCount === 1
                      ? 'Enter the speaker name'
                      : `Enter the names of all ${participantCount} participants`}
                  </p>
                  <div className="space-y-2">
                    {metadata.participants.map((participant, index) => (
                      <input
                        key={index}
                        type="text"
                        value={participant}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                        placeholder={`${participantCount === 1 ? 'Speaker' : `Participant ${index + 1}`}`}
                        className="w-full rounded-xl border border-gray-300 p-3 text-sm transition-all focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <div className="flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleStep2Continue}
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Continue to Prompts →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Prompt Selection */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 border-gray-200 shadow-sm">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-gray-900" />
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    Step 3: Select Analysis Tasks
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Choose which insights you want to extract (select multiple, max 5)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPrompts ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
                      <p className="mt-4 text-sm text-gray-600">Loading prompts...</p>
                    </div>
                  </div>
                ) : availablePrompts.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-gray-500">No prompts available</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {availablePrompts.map((prompt, index) => (
                      <motion.button
                        key={prompt.task_name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => togglePrompt(prompt.task_name)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          selectedPrompts.has(prompt.task_name)
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {prompt.task_name}
                          </span>
                          {selectedPrompts.has(prompt.task_name) && (
                            <Check className="h-4 w-4 flex-shrink-0 text-gray-900" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {prompt.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}

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

            {/* Continue Button */}
            <div className="flex justify-end gap-4 items-center">
              <p className="text-sm text-gray-500">
                {selectedPrompts.size + (customPrompt.trim() ? 1 : 0)} of 5 prompts selected
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleContinue}
                  disabled={selectedPrompts.size === 0 && !customPrompt.trim()}
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Rip This Script! →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
