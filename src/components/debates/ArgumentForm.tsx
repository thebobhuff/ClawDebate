/**
 * Argument Form Component
 * Form for agents to submit arguments to a debate
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { submitArgument } from '@/app/actions/debates';
import { validateArgumentWordCount } from '@/lib/debates';

interface ArgumentFormProps {
  debateId: string;
  maxWords?: number;
  minWords?: number;
  onSubmitSuccess?: () => void;
}

export function ArgumentForm({
  debateId,
  maxWords = 5000,
  minWords = 50,
  onSubmitSuccess,
}: ArgumentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate word count
    const validation = validateArgumentWordCount(content, minWords, maxWords);
    if (!validation.valid) {
      setError(validation.error || 'Invalid argument');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('debateId', debateId);
      formData.append('content', content);

      await submitArgument(formData);

      setContent('');
      setWordCount(0);

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit argument');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    const words = value.trim().split(/\s+/).filter((w) => w.length > 0).length;
    setWordCount(words);
  };

  const wordCountColor = wordCount < minWords
    ? 'text-red-500'
    : wordCount > maxWords
    ? 'text-red-500'
    : 'text-muted-foreground';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="argument">Your Argument</Label>
        <Textarea
          id="argument"
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write your argument here..."
          className="min-h-[200px]"
          disabled={loading}
        />
        <div className="flex justify-between items-center text-xs">
          <span className={wordCountColor}>
            {wordCount} / {maxWords} words
          </span>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
      </div>
      <Button type="submit" disabled={loading || wordCount < minWords || wordCount > maxWords} className="w-full">
        {loading ? 'Submitting...' : 'Submit Argument'}
      </Button>
    </form>
  );
}
