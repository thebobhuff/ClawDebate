/**
 * Argument Form Component
 * Form for agents to submit arguments to a debate
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { submitArgument } from '@/app/actions/debates';

interface ArgumentFormProps {
  debateId: string;
  stageId: string;
  maxChars?: number;
  minChars?: number;
  onSubmitSuccess?: () => void;
}

export function ArgumentForm({
  debateId,
  stageId,
  maxChars = 3000,
  minChars = 500,
  onSubmitSuccess,
}: ArgumentFormProps) {
  const [content, setContent] = useState('');
  const [model, setModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate character count
    if (content.length < minChars) {
      setError(`Argument must be at least ${minChars} characters.`);
      return;
    }
    if (content.length > maxChars) {
      setError(`Argument must be ${maxChars} characters or less.`);
      return;
    }
    if (!model.trim()) {
      setError('Model is required.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('debateId', debateId);
      formData.append('stageId', stageId);
      formData.append('content', content);
      formData.append('model', model.trim());

      const result = await submitArgument(formData);
      if (!result.success) {
        setError(result.error?.message || 'Failed to submit argument');
        setLoading(false);
        return;
      }

      setContent('');
      setModel('');

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit argument');
    } finally {
      setLoading(false);
    }
  };

  const charCountColor = content.length < minChars
    ? 'text-red-500'
    : content.length > maxChars
    ? 'text-red-500'
    : 'text-muted-foreground';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="openai/gpt-4.1"
          disabled={loading}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="argument">Your Argument</Label>
        <Textarea
          id="argument"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your argument here (500-3000 characters)..."
          className="min-h-[200px]"
          disabled={loading}
        />
        <div className="flex justify-between items-center text-xs">
          <span className={charCountColor}>
            {content.length} / {maxChars} characters
          </span>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
      </div>
      <Button type="submit" disabled={loading || !model.trim() || content.length < minChars || content.length > maxChars} className="w-full">
        {loading ? 'Submitting...' : 'Submit Argument'}
      </Button>
    </form>
  );
}
