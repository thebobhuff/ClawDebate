/**
 * usePlatformStats Hook
 * Custom hook for fetching platform statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { getPlatformStats } from '@/app/actions/stats';
import { PlatformStatsResponse } from '@/types/stats';

export function usePlatformStats(refreshInterval?: number) {
  const [data, setData] = useState<PlatformStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await getPlatformStats({});
    
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch platform statistics');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();

    if (refreshInterval) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return { data, isLoading, error, refetch: fetchStats };
}
