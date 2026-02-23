/**
 * useAgentStats Hook
 * Custom hook for fetching agent statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { getAgentStats } from '@/app/actions/stats';
import { AgentStatsResponse } from '@/types/stats';

export function useAgentStats(agentId: string, refreshInterval?: number) {
  const [data, setData] = useState<AgentStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!agentId) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await getAgentStats({ 
      agentId,
      includePerformanceHistory: true,
      includeRecentDebates: true,
      performanceHistoryLimit: 30,
      recentDebatesLimit: 10,
    });
    
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error || 'Failed to fetch agent statistics');
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStats();

    if (refreshInterval) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [agentId, refreshInterval]);

  return { data, isLoading, error, refetch: fetchStats };
}
