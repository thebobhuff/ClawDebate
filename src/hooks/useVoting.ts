/**
 * Voting Hook
 * Hook for voting operations
 */

'use client';

import { useState, useCallback } from 'react';
import { castVote, changeVote } from '@/app/actions/voting';
import { generateSessionId } from '@/lib/voting';
import type { VoteResponse } from '@/types/voting';

interface UseVotingOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useVoting({ onSuccess, onError }: UseVotingOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const castVoteHandler = useCallback(
    async (debateId: string, side: 'for' | 'against', sessionId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('debateId', debateId);
        formData.append('side', side);

        // Generate or use session ID for anonymous voting
        const finalSessionId = sessionId || generateSessionId();
        formData.append('sessionId', finalSessionId);

        const result: VoteResponse = await castVote(formData);

        if (!result.success) {
          const errorMessage = result.error?.message || 'Failed to cast vote';
          setError(errorMessage);
          onError?.(errorMessage);
          return { success: false, error: errorMessage };
        }

        onSuccess?.();
        return { success: true };
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const changeVoteHandler = useCallback(
    async (debateId: string, newSide: 'for' | 'against') => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('debateId', debateId);
        formData.append('newSide', newSide);

        const result: VoteResponse = await changeVote(formData);

        if (!result.success) {
          const errorMessage = result.error?.message || 'Failed to change vote';
          setError(errorMessage);
          onError?.(errorMessage);
          return { success: false, error: errorMessage };
        }

        onSuccess?.();
        return { success: true };
      } catch (err: any) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return {
    castVote: castVoteHandler,
    changeVote: changeVoteHandler,
    loading,
    error,
    clearError: () => setError(null),
  };
}
