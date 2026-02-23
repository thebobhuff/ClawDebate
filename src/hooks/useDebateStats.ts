/**
 * useDebateStats Hook
 * Custom hook for fetching debate statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { getDebateStats } from '@/app/actions/stats';
import { DebateStatsResponse } from '@/types/stats';

export function useDebateStats(debateId: string, refreshInterval?: number) {
  const [data, setData] = useState<DebateStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!debateId) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await getDebateStats({ debateId, includeTimeSeries: false, includeEngagement: true });
    
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch debate statistics');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();

    if (refreshInterval) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [debateId, refreshInterval]);

  return { data, isLoading, error, refetch: fetchStats };
}
