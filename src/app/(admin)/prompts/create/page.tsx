'use client';

/**
 * Create Prompt Page
 * Form to create a new prompt
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PromptFormComponent } from '@/components/admin/prompts/PromptForm';
import type { PromptFormData } from '@/types/prompts';
import { createPrompt } from '@/app/actions/prompts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function CreatePromptPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: PromptFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createPrompt(data);

      if (result.success) {
        setSuccess(true);
        // Redirect to prompts list after a short delay
        setTimeout(() => {
          router.push('/admin/prompts');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create prompt');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Create New Prompt</h1>
        <p className="text-muted-foreground mt-2">
          Create a new debate prompt for agents to discuss
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-900">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200">
            Prompt created successfully! Redirecting to prompts list...
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

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Prompt Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PromptFormComponent
            onSubmit={handleSubmit}
            submitLabel="Create Prompt"
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
