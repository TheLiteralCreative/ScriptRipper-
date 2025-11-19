'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, Zap, Users, FileText, Sparkles, ChevronDown } from 'lucide-react';
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

interface PromptDescription {
  what: string;
  why: string;
  how: string;
  who: string;
}

// Enhanced prompt descriptions with What/Why/How/Who format
// Keys must match exact task_name values from the database
const PROMPT_DESCRIPTIONS: Record<string, PromptDescription> = {
  'Action Items Tracker': {
    what: 'Finds every concrete to-do with owner, due date, and live status.',
    why: 'Turns talk into accountable work—no loose ends.',
    how: '4-column table (Task, Assigned To, Due Date, Status) with status inferred from context; sorted by due date.',
    who: 'PMs and team leads handing off to Jira/Asana.',
  },
  'Key Decisions Log': {
    what: 'Logs every final decision and distills the three biggest implications.',
    why: 'Locks alignment and momentum.',
    how: 'Numbered decision list with owners → “Top 3 Takeaways” derived only from those decisions.',
    who: 'Execs/PMs who need crisp outcomes.',
  },
  'Client Expectations Report': {
    what: 'Pulls the client’s concrete asks, unspoken relational signals, and emotional tone.',
    why: 'Prevents misalignment and surprise escalations.',
    how: 'Three sections with justification quotes/examples.',
    who: 'Account managers & consultants.',
  },
  'Friction & Foresight Report': {
    what: 'Flags current disputes and likely flashpoints—each paired with advice.',
    why: 'Defuses risk early.',
    how: 'Two sections, bulleted issues with people + bold Advice.',
    who: 'Facilitators, product leads, client services.',
  },
  'Communication Insights (SSC)': {
    what: 'Surfaces team dynamics and turns them into a Start–Stop–Continue plan.',
    why: 'Improves collaboration and cuts repeat misfires.',
    how: 'Evidence-backed insights + targeted actions mapped one-to-one.',
    who: 'Team leads, coaches, client managers.',
  },
  'Full Record Markdown': {
    what: 'Converts raw transcript into clean, shareable Markdown.',
    why: 'Makes long notes readable and navigable.',
    how: 'H1 + meta + H2 sections by time; speakers/timestamps preserved.',
    who: 'Ops teams, archivists, minute-takers.',
  },
  'Timestamped Outline & Recipes': {
    what: 'Full, timestamped outline with optional recipes/CTA/quotes/takeaways.',
    why: 'Lets readers grasp everything fast without the video.',
    how: 'H1 + bold meta; H2 time ranges; dense bullets; recipes table.',
    who: 'Content editors, enablement teams, note-takers.',
  },
  'Audience Activation Artifacts': {
    what: 'Spins the talk into tweets, social snippets, slide bullets, FAQs, exercises, and more.',
    why: 'Extends reach across channels with zero extra drafting.',
    how: 'Strict headings; platform-ready formats (tweets, Q&A, lists, KPIs).',
    who: 'Creators, marketers, coaches.',
  },
  'Tutorial Step-Down & Actionable How-To Extractor': {
    what: 'Converts tutorials hidden in the talk into step-by-step guides with inputs, parameters, and validation.',
    why: 'Saves hours turning videos into docs novices can execute.',
    how: 'One or more blocks with tables, checklists, quotes+timestamps, troubleshooting.',
    who: 'Educators, dev-tool instructors, enablement.',
  },
  'Important Quotes': {
    what: 'Pulls the 3–5 lines that matter most—word-for-word.',
    why: 'Preserves pivotal moments for sharing and follow-up.',
    how: 'Bulleted items with bold timestamps, speaker, and exact quote.',
    who: 'Execs, comms, and enablement teams.',
  },
  'Participants & Roles': {
    what: 'Identifies everyone involved and their roles (when stated).',
    why: 'Helps teams map stakeholders fast.',
    how: 'Clean, alphabetized bullets in a fixed format.',
    who: 'Coordinators, assistants, onboarding users.',
  },
  'Content Nuggets': {
    what: 'Harvests high-value tidbits—tools, stats, steps, frameworks, lessons.',
    why: 'Makes insights portable for docs, posts, and training.',
    how: 'Categorized bullets with a brief context note.',
    who: 'Content ops, enablement, knowledge bases.',
  },
  'Relationship & Dependency Map': {
    what: 'Shows how ideas and tools connect and in what order.',
    why: 'Prevents mis-sequencing and clarifies choices.',
    how: 'Dependency statements, comparison tables, references, and roadmaps.',
    who: 'Architects, curriculum designers, strategists.',
  },
  'Structural & Contextual Metadata': {
    what: 'Builds a complete metadata header for discovery.',
    why: 'Improves search, filtering, and reuse.',
    how: 'Fixed key-value bullets with “Not available” where missing.',
    who: 'Librarians, SEO & content ops.',
  },
  'Quality & Credibility Signals': {
    what: 'Scores expertise, evidence style, consensus, and bias.',
    why: 'Reduces risk of amplifying weak or sponsored content.',
    how: 'Bold assessments backed by quotes; flags missing evidence.',
    who: 'Editors, educators, researchers.',
  },
  'Processing Health Check': {
    what: 'Rates how cleanly the transcript can be mined.',
    why: 'Guides whether to trust outputs or request a redo.',
    how: 'Four brief assessments with justifications.',
    who: 'Ops/QA managing transcript pipelines.',
  },
  'One-Paragraph Summary': {
    what: 'Compresses the whole talk into one tight paragraph.',
    why: 'Saves leaders time without losing the plot.',
    how: 'Purpose, problems, decisions, outcome in dense prose.',
    who: 'Executives and sponsors.',
  },
  'Overview Summary': {
    what: 'Narrative brief from purpose to outcomes.',
    why: 'Gives decision-makers full context without noise.',
    how: 'Multi-paragraph prose covering problems/solutions, debates, and results.',
    who: 'Execs and PMOs.',
  },
};

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
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

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

    if (currentStep === 2) {
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

  const toggleExpanded = (taskName: string) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(taskName)) {
      newExpanded.delete(taskName);
    } else {
      newExpanded.add(taskName);
    }
    setExpandedPrompts(newExpanded);
  };

  const expandAll = () => {
    const allTaskNames = availablePrompts.map(p => p.task_name);
    setExpandedPrompts(new Set(allTaskNames));
  };

  const collapseAll = () => {
    setExpandedPrompts(new Set());
  };

  const handleStep1Continue = () => {
    if (participantCount > 0) {
      setCurrentStep(2);
    }
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
            Step {currentStep} of 2
          </p>
        </motion.div>

        {/* Progress Indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2].map((step) => (
            <div
              key={step}
              className={`h-2 w-32 rounded-full transition-all ${
                step <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Participant Information & Metadata (Combined) */}
        {currentStep === 1 && (
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
                    Step 1: Transcript Information
                  </CardTitle>
                </div>
                <CardDescription className="text-base">
                  Tell us about this transcript (metadata helps with organization and file naming)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {/* Type of Content */}
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

                {/* Divider */}
                <div className="border-t border-gray-200 pt-6">
                  <p className="mb-4 text-sm font-medium text-gray-700">
                    Additional Details <span className="text-gray-500 font-normal">(optional)</span>
                  </p>
                </div>

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
                  onClick={handleStep1Continue}
                  disabled={participantCount < 1 || (participantType === 'other' && !customType.trim())}
                  size="lg"
                  className="bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
                >
                  Continue to Prompts →
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Prompt Selection */}
        {currentStep === 2 && (
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
                    Step 2: Select Analysis Tasks
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
                  <>
                    {/* Expand All / Collapse All Controls */}
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex gap-2">
                        <Button
                          onClick={expandAll}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 text-xs"
                        >
                          <ChevronDown className="h-3.5 w-3.5 mr-1" />
                          Expand All
                        </Button>
                        <Button
                          onClick={collapseAll}
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-900 text-xs"
                        >
                          <ChevronDown className="h-3.5 w-3.5 mr-1 rotate-180" />
                          Collapse All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {availablePrompts.map((prompt, index) => {
                      const isExpanded = expandedPrompts.has(prompt.task_name);
                      const isSelected = selectedPrompts.has(prompt.task_name);

                      // Try to get enhanced description from PROMPT_DESCRIPTIONS
                      let enhancedDesc = PROMPT_DESCRIPTIONS[prompt.task_name];

                      // If not found, try to parse from database description field
                      if (!enhancedDesc && prompt.description) {
                        const desc = prompt.description;
                        const whatMatch = desc.match(/What:\s*([^]*?)(?=\s*Why:)/i);
                        const whyMatch = desc.match(/Why:\s*([^]*?)(?=\s*How:)/i);
                        const howMatch = desc.match(/How:\s*([^]*?)(?=\s*Who:)/i);
                        const whoMatch = desc.match(/Who:\s*([^]*?)$/i);

                        if (whatMatch && whyMatch && howMatch && whoMatch) {
                          enhancedDesc = {
                            what: whatMatch[1].trim(),
                            why: whyMatch[1].trim(),
                            how: howMatch[1].trim(),
                            who: whoMatch[1].trim(),
                          };
                        }
                      }

                      return (
                        <motion.div
                          key={prompt.task_name}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          className={`rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Header - Always Visible */}
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                onClick={() => toggleExpanded(prompt.task_name)}
                                className="flex-shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
                              >
                                <motion.div
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronDown className="h-5 w-5" />
                                </motion.div>
                              </button>
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {prompt.task_name}
                                </h3>
                                {!isExpanded && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {enhancedDesc?.what || prompt.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => togglePrompt(prompt.task_name)}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className={`flex-shrink-0 ml-4 ${
                                isSelected
                                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Selected
                                </>
                              ) : (
                                'Select'
                              )}
                            </Button>
                          </div>

                          {/* Expanded Content */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: isExpanded ? 'auto' : 0,
                              opacity: isExpanded ? 1 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                              <div className="space-y-4">
                                {/* What section */}
                                {enhancedDesc && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                                      📋 What:
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {enhancedDesc.what}
                                    </p>
                                  </div>
                                )}

                                {/* Why section */}
                                {enhancedDesc && (
                                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                                      💡 Why:
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {enhancedDesc.why}
                                    </p>
                                  </div>
                                )}

                                {/* How section */}
                                {enhancedDesc && (
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                                      ⚙️ How:
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {enhancedDesc.how}
                                    </p>
                                  </div>
                                )}

                                {/* Who section */}
                                {enhancedDesc && (
                                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <h4 className="text-xs font-semibold text-gray-900 mb-2">
                                      👥 Great for:
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {enhancedDesc.who}
                                    </p>
                                  </div>
                                )}

                                {/* Fallback for prompts without enhanced descriptions */}
                                {!enhancedDesc && (
                                  <div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {prompt.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                    </div>
                  </>
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
