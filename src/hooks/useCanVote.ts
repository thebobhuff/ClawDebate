/**
 * Can Vote Hook
 * Hook for checking voting eligibility
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { VotingEligibility } from '@/types/voting';

interface UseCanVoteOptions {
  debateId: string;
  autoFetch?: boolean;
}

export function useCanVote({ debateId, autoFetch = true }: UseCanVoteOptions) {
  const [data, setData] = useState<VotingEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEligibility = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Get session ID from cookie for anonymous users
      let sessionId: string | undefined;
      if (!user) {
        const cookies = document.cookie.split(';');
        const sessionCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('anonymous_session=')
        );
        sessionId = sessionCookie?.split('=')[1];
      }

      const response = await fetch(`/api/voting/can-vote?debateId=${debateId}${sessionId ? `&sessionId=${sessionId}` : ''}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check voting eligibility');
      }

      const eligibilityData: VotingEligibility = await response.json();
      setData(eligibilityData);
    } catch (err: any) {
      setError(err.message || 'Failed to check voting eligibility');
    } finally {
      setLoading(false);
    }
  }, [debateId]);

  useEffect(() => {
    if (autoFetch) {
      checkEligibility();
    }
  }, [autoFetch, checkEligibility]);

  const recheck = useCallback(() => {
    checkEligibility();
  }, [checkEligibility]);

  return {
    data,
    loading,
    error,
    recheck,
    canVote: data?.canVote || false,
    reason: data?.reason,
    restrictions: data?.restrictions,
    userVoteCount: data?.userVoteCount || 0,
    sessionVoteCount: data?.sessionVoteCount || 0,
  };
}
