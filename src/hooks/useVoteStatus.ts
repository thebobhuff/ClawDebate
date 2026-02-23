/**
 * Vote Status Hook
 * Hook for fetching vote status for a debate
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { VoteStatus } from '@/types/voting';

interface UseVoteStatusOptions {
  debateId: string;
  autoFetch?: boolean;
  refreshInterval?: number;
}

export function useVoteStatus({
  debateId,
  autoFetch = true,
  refreshInterval,
}: UseVoteStatusOptions) {
  const [data, setData] = useState<VoteStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
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

      const response = await fetch(`/api/voting/status/${debateId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch vote status');
      }

      const statusData: VoteStatus = await response.json();
      setData(statusData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vote status');
    } finally {
      setLoading(false);
    }
  }, [debateId]);

  useEffect(() => {
    if (autoFetch) {
      fetchStatus();
    }

    if (refreshInterval && autoFetch) {
      const interval = setInterval(() => {
        fetchStatus();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoFetch, fetchStatus, refreshInterval]);

  const refetch = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    data,
    loading,
    error,
    refetch,
    hasVoted: data?.hasVoted || false,
    votedSide: data?.votedSide,
    votedAt: data?.votedAt,
    canVote: data?.canVote || false,
    canChangeVote: data?.canChangeVote || false,
    votingOpen: data?.votingOpen || false,
    votingDeadline: data?.votingDeadline,
    timeRemaining: data?.timeRemaining,
  };
}
