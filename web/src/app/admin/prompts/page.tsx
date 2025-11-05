'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, ArrowLeft, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { adminApi } from '@/lib/api';

interface Prompt {
  id: string;
  task_name: string;
  prompt: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromptsManagement() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    task_name: '',
    prompt: '',
    category: 'meetings',
  });

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await adminApi.listPrompts(category);
      setPrompts(data);
    } catch (err: any) {
      console.error('Failed to load prompts:', err);
      setError(err.response?.data?.detail || 'Failed to load prompts');

      if (err.response?.status === 401 || err.response?.status === 403) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminApi.createPrompt(formData);
      setShowAddForm(false);
      setFormData({ task_name: '', prompt: '', category: 'meetings' });
      loadPrompts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create prompt');
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;

    try {
      await adminApi.updatePrompt(editingPrompt.id, formData);
      setEditingPrompt(null);
      setFormData({ task_name: '', prompt: '', category: 'meetings' });
      loadPrompts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update prompt');
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await adminApi.deletePrompt(promptId);
      loadPrompts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete prompt');
    }
  };

  const handleToggleActive = async (prompt: Prompt) => {
    try {
      await adminApi.updatePrompt(prompt.id, { is_active: !prompt.is_active });
      loadPrompts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle prompt');
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      task_name: prompt.task_name,
      prompt: prompt.prompt,
      category: prompt.category,
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingPrompt(null);
    setShowAddForm(false);
    setFormData({ task_name: '', prompt: '', category: 'meetings' });
  };

  const filteredPrompts =
    selectedCategory === 'all'
      ? prompts
      : prompts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-7xl pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              Prompt Bank Management
            </h1>
            <p className="text-gray-600">
              Add, edit, or remove analysis prompts for meetings and presentations
            </p>
          </div>
          <Button
            onClick={() => {
              setShowAddForm(true);
              setEditingPrompt(null);
              setFormData({ task_name: '', prompt: '', category: 'meetings' });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Prompt
          </Button>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2">
          {['all', 'meetings', 'presentations'].map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading prompts...</p>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || editingPrompt) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={formData.task_name}
                    onChange={(e) =>
                      setFormData({ ...formData, task_name: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="e.g., Action Items"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="meetings">Meetings</option>
                    <option value="presentations">Presentations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) =>
                      setFormData({ ...formData, prompt: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2"
                    rows={8}
                    placeholder="Enter the analysis prompt..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={editingPrompt ? handleUpdate : handleCreate}
                    disabled={
                      !formData.task_name || !formData.prompt || !formData.category
                    }
                  >
                    {editingPrompt ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prompts List */}
        {!loading && !error && (
          <div className="grid gap-4">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {prompt.task_name}
                        </h3>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            prompt.category === 'meetings'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {prompt.category}
                        </span>
                        <button
                          onClick={() => handleToggleActive(prompt)}
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            prompt.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {prompt.is_active ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {prompt.prompt}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(prompt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPrompts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-600">
                    No prompts found for this category.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
