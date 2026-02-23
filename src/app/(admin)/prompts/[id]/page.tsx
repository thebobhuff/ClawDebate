'use client';

/**
 * Edit Prompt Page
 * Form to edit an existing prompt
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PromptFormComponent } from '@/components/admin/prompts/PromptForm';
import { PromptStatsComponent } from '@/components/admin/prompts/PromptStats';
import type { PromptFormData, PromptWithDetails } from '@/types/prompts';
import { updatePrompt, deletePrompt, getPromptById } from '@/app/actions/prompts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPromptPage() {
  const router = useRouter();
  const params = useParams();
  const promptId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [prompt, setPrompt] = useState<PromptWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Load prompt data on mount
  useEffect(() => {
    loadPrompt();
  }, [promptId]);

  const loadPrompt = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPromptById(promptId);

      if (result.success && result.data) {
        setPrompt(result.data);
      } else {
        setError(result.error || 'Failed to load prompt');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PromptFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updatePrompt(promptId, data);

      if (result.success) {
        setSuccess(true);
        // Reload prompt data after update
        await loadPrompt();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to update prompt');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deletePrompt(promptId);

      if (result.success) {
        router.push('/admin/prompts');
      } else {
        setError(result.error || 'Failed to delete prompt');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading prompt...</div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200">
            {error || 'Prompt not found'}
          </p>
        </div>
        <Link href="/admin/prompts">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Prompts
          </Button>
        </Link>
      </div>
    );
  }

  const initialData: Partial<PromptFormData> = {
    title: prompt.title,
    category: prompt.category as any,
    description: prompt.description,
    tags: prompt.tags || [],
    status: prompt.status as any,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/prompts" className="text-muted-foreground hover:text-foreground mb-2 inline-block">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Prompts
          </Link>
          <h1 className="text-3xl font-bold">Edit Prompt</h1>
          <p className="text-muted-foreground mt-2">
            Edit debate prompt details and view statistics
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting || isSubmitting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete Prompt'}
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200">
            Prompt updated successfully!
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-900">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Prompt Statistics */}
      {prompt.stats && (
        <PromptStatsComponent stats={prompt.stats} />
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PromptFormComponent
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="Update Prompt"
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
