/**
 * Vote History Hook
 * Hook for fetching voting history
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { VoteHistoryResponse, VoteHistoryFilters } from '@/types/voting';

interface UseVoteHistoryOptions {
  filters?: VoteHistoryFilters;
  autoFetch?: boolean;
}

export function useVoteHistory({ filters = {}, autoFetch = true }: UseVoteHistoryOptions = {}) {
  const [data, setData] = useState<VoteHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in to view your voting history');
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.outcome && filters.outcome !== 'all') {
        params.append('outcome', filters.outcome);
      }
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters.sortOrder) {
        params.append('sortOrder', filters.sortOrder);
      }

      const response = await fetch(`/api/voting/history?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch voting history');
      }

      const historyData: VoteHistoryResponse = await response.json();
      setData(historyData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch voting history');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (autoFetch) {
      fetchHistory();
    }
  }, [autoFetch, fetchHistory]);

  const refetch = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  const loadMore = useCallback(() => {
    if (data && data.hasMore) {
      const newFilters = {
        ...filters,
        page: (filters.page || 1) + 1,
      };
      // Note: This would need to be implemented to append data
      // For now, we'll just refetch with the new page
      fetchHistory();
    }
  }, [data, filters, fetchHistory]);

  return {
    data,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: data?.hasMore || false,
    total: data?.total || 0,
    stats: data?.stats || {
      totalVotes: 0,
      won: 0,
      lost: 0,
      pending: 0,
      winRate: 0,
    },
  };
}
