'use client';

/**
 * Prompt Form Component
 * Form component for creating/editing prompts
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PromptFormData } from '@/types/prompts';
import { PromptCategory, PromptStatus } from '@/types/database';
import { getAllCategories } from '@/lib/prompts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from './TagInput';
import { Loader2 } from 'lucide-react';

interface PromptFormProps {
  initialData?: Partial<PromptFormData>;
  onSubmit: (data: PromptFormData) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export function PromptFormComponent({
  initialData,
  onSubmit,
  submitLabel = 'Create Prompt',
  isSubmitting = false,
}: PromptFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PromptFormData>({
    title: initialData?.title || '',
    category: initialData?.category || 'philosophical',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    word_limit: initialData?.word_limit || 500,
    time_limit: initialData?.time_limit || null,
    status: initialData?.status || 'draft',
  });

  const categories = getAllCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter prompt title..."
          required
          minLength={10}
          maxLength={200}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          {formData.title.length}/200 characters (min 10)
        </p>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value as PromptCategory })
          }
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          required
          disabled={isSubmitting}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter a detailed description of the prompt..."
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/2000 characters (min 20)
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">
          Tags <span className="text-destructive">*</span>
        </Label>
        <TagInput
          tags={formData.tags}
          onChange={(tags) => setFormData({ ...formData, tags })}
          placeholder="Add a tag..."
          maxTags={10}
          disabled={isSubmitting}
        />
      </div>

      {/* Word Limit */}
      <div className="space-y-2">
        <Label htmlFor="word_limit">
          Word Limit <span className="text-destructive">*</span>
        </Label>
        <Input
          id="word_limit"
          type="number"
          value={formData.word_limit}
          onChange={(e) =>
            setFormData({ ...formData, word_limit: parseInt(e.target.value) || 0 })
          }
          min={50}
          max={5000}
          required
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 50, maximum 5000 words
        </p>
      </div>

      {/* Time Limit (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="time_limit">Time Limit (Optional)</Label>
        <Input
          id="time_limit"
          type="number"
          value={formData.time_limit || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              time_limit: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          min={1}
          max={1440}
          placeholder="Leave empty for no time limit"
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Time limit in minutes (1-1440, max 24 hours). Leave empty for no limit.
        </p>
      </div>

      {/* Status (only for editing) */}
      {initialData?.status && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as PromptStatus })
            }
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
            disabled={isSubmitting}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
