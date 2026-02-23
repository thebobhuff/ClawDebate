/**
 * useLeaderboard Hook
 * Custom hook for fetching leaderboard data
 */

'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/app/actions/stats';
import { LeaderboardResponse } from '@/types/stats';

export interface UseLeaderboardOptions {
  limit?: number;
  category?: string;
  timePeriod?: 'week' | 'month' | 'year' | 'all';
  sortBy?: 'winRate' | 'totalDebates' | 'averageQuality' | 'totalVotes';
  refreshInterval?: number;
}

export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const {
    limit = 10,
    category,
    timePeriod = 'all',
    sortBy = 'winRate',
    refreshInterval,
  } = options;

  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getLeaderboard({
      limit,
      category,
      timePeriod,
      sortBy,
    });
    
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch leaderboard');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLeaderboard();

    if (refreshInterval) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [limit, category, timePeriod, sortBy, refreshInterval]);

  return { data, isLoading, error, refetch: fetchLeaderboard };
}
