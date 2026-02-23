/**
 * Statistics Utility Functions
 * Helper functions for calculating and formatting statistics
 */

import {
  PlatformStats,
  DebateStats,
  AgentPerformance,
  AgentPerformanceOverTime,
  CategoryStats,
  VoteDistribution,
  ArgumentStats,
  TimeSeriesData,
  TimePeriod,
  DebateSide,
} from '@/types/stats';

// ============================================================================
// Platform Statistics Calculations
// ============================================================================

export function calculatePlatformStats(data: {
  debates: any[];
  agents: any[];
  prompts: any[];
  votes: any[];
  arguments: any[];
}): PlatformStats {
  const totalDebates = data.debates.length;
  const activeDebates = data.debates.filter((d) => d.status === 'active').length;
  const completedDebates = data.debates.filter((d) => d.status === 'completed').length;
  const totalVotes = data.votes.length;
  const totalArguments = data.arguments.length;
  const totalAgents = data.agents.length;
  const totalPrompts = data.prompts.length;

  // Calculate total unique participants
  const participantSet = new Set(
    data.debates.flatMap((d) => d.participants?.map((p: any) => p.agent_id) || [])
  );
  const totalParticipants = participantSet.size;

  // Calculate average debate duration
  const completedDebateDurations = data.debates
    .filter((d) => d.status === 'completed' && d.started_at && d.ended_at)
    .map((d) => {
      const start = new Date(d.started_at).getTime();
      const end = new Date(d.ended_at).getTime();
      return (end - start) / (1000 * 60); // Convert to minutes
    });

  const averageDebateDuration =
    completedDebateDurations.length > 0
      ? completedDebateDurations.reduce((a, b) => a + b, 0) / completedDebateDurations.length
      : 0;

  // Find most active day and hour
  const dayCounts: Record<string, number> = {};
  const hourCounts: Record<number, number> = {};

  data.debates.forEach((debate) => {
    const date = new Date(debate.created_at);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();

    dayCounts[day] = (dayCounts[day] || 0) + 1;
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const mostActiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const mostActiveHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0');

  return {
    totalDebates,
    totalAgents,
    totalPrompts,
    totalVotes,
    activeDebates,
    completedDebates,
    totalArguments,
    totalParticipants,
    averageDebateDuration,
    mostActiveDay,
    mostActiveHour,
  };
}

// ============================================================================
// Debate Statistics Calculations
// ============================================================================

export function calculateDebateStats(data: {
  debate: any;
  votes: any[];
  arguments: any[];
  participants: any[];
}): DebateStats {
  const { debate, votes, arguments: args, participants } = data;

  // Calculate vote distribution
  const forVotes = votes.filter((v) => v.side === 'for').length;
  const againstVotes = votes.filter((v) => v.side === 'against').length;
  const totalVotes = votes.length;

  const voteDistribution: VoteDistribution[] = [
    {
      side: 'for',
      count: forVotes,
      percentage: totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0,
    },
    {
      side: 'against',
      count: againstVotes,
      percentage: totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0,
    },
  ];

  // Calculate argument statistics
  const forArgs = args.filter((a) => a.side === 'for');
  const againstArgs = args.filter((a) => a.side === 'against');

  const calculateAverageLength = (args: any[]) => {
    if (args.length === 0) return 0;
    const totalLength = args.reduce((sum, arg) => sum + (arg.content?.length || 0), 0);
    return totalLength / args.length;
  };

  const argumentStats: ArgumentStats[] = [
    {
      side: 'for',
      count: forArgs.length,
      averageLength: calculateAverageLength(forArgs),
      totalLength: forArgs.reduce((sum, arg) => sum + (arg.content?.length || 0), 0),
    },
    {
      side: 'against',
      count: againstArgs.length,
      averageLength: calculateAverageLength(againstArgs),
      totalLength: againstArgs.reduce((sum, arg) => sum + (arg.content?.length || 0), 0),
    },
  ];

  // Calculate participation metrics
  const uniqueVoters = new Set(votes.map((v) => v.user_id)).size;
  const totalParticipants = participants.length;
  const averageVotesPerUser = uniqueVoters > 0 ? totalVotes / uniqueVoters : 0;

  const participationMetrics = {
    totalParticipants,
    uniqueVoters,
    averageVotesPerUser,
  };

  // Calculate time-based statistics
  const createdAt = new Date(debate.created_at);
  const startedAt = debate.started_at ? new Date(debate.started_at) : null;
  const endedAt = debate.ended_at ? new Date(debate.ended_at) : null;

  let duration: number | null = null;
  if (startedAt && endedAt) {
    duration = (endedAt.getTime() - startedAt.getTime()) / (1000 * 60);
  }

  // Calculate average argument interval
  let averageArgumentInterval = 0;
  if (args.length > 1 && startedAt) {
    const sortedArgs = [...args].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const intervals: number[] = [];
    for (let i = 1; i < sortedArgs.length; i++) {
      const prevTime = new Date(sortedArgs[i - 1].created_at).getTime();
      const currTime = new Date(sortedArgs[i].created_at).getTime();
      intervals.push((currTime - prevTime) / (1000 * 60));
    }
    averageArgumentInterval = intervals.length > 0
      ? intervals.reduce((a, b) => a + b, 0) / intervals.length
      : 0;
  }

  const timeBasedStats = {
    createdAt,
    startedAt,
    endedAt,
    duration,
    averageArgumentInterval,
  };

  // Calculate engagement metrics (placeholder values - would need to track views, shares, comments)
  const engagementMetrics = {
    viewCount: debate.view_count || 0,
    shareCount: debate.share_count || 0,
    commentCount: debate.comment_count || 0,
    engagementRate: calculateEngagementRate(
      debate.view_count || 0,
      totalVotes,
      args.length
    ),
  };

  return {
    debateId: debate.id,
    totalVotes,
    totalArguments: args.length,
    voteDistribution,
    argumentStats,
    participationMetrics,
    timeBasedStats,
    engagementMetrics,
  };
}

function calculateEngagementRate(views: number, votes: number, comments: number): number {
  if (views === 0) return 0;
  const engagement = votes + comments;
  return (engagement / views) * 100;
}

// ============================================================================
// Agent Performance Calculations
// ============================================================================

export function calculateAgentPerformance(data: {
  agent: any;
  debates: any[];
  votes: any[];
  arguments: any[];
}): AgentPerformance {
  const { agent, debates, votes, arguments: args } = data;

  const totalDebates = debates.length;
  const wins = debates.filter((d) => d.winner_agent_id === agent.id).length;
  const losses = debates.filter((d) => d.status === 'completed' && d.winner_agent_id !== agent.id).length;
  const draws = debates.filter((d) => d.status === 'completed' && d.winner_agent_id === null).length;

  const winRate = totalDebates > 0 ? (wins / totalDebates) * 100 : 0;

  // Calculate average argument quality (placeholder - would need quality scoring)
  const averageArgumentQuality = 75; // Default placeholder

  const totalArguments = args.length;
  const averageArgumentLength =
    args.length > 0
      ? args.reduce((sum, arg) => sum + (arg.content?.length || 0), 0) / args.length
      : 0;

  // Calculate participation rate (debates joined / total available debates)
  const participationRate = 85; // Placeholder - would need total available debates

  // Calculate average response time
  const responseTimes: number[] = [];
  args.forEach((arg) => {
    const debate = debates.find((d) => d.id === arg.debate_id);
    if (debate && debate.started_at) {
      const startTime = new Date(debate.started_at).getTime();
      const argTime = new Date(arg.created_at).getTime();
      responseTimes.push((argTime - startTime) / (1000 * 60));
    }
  });

  const averageResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

  const lastActive =
    args.length > 0
      ? new Date(Math.max(...args.map((a) => new Date(a.created_at).getTime())))
      : new Date(agent.created_at);

  return {
    agentId: agent.id,
    agentName: agent.display_name,
    totalDebates,
    wins,
    losses,
    draws,
    winRate,
    averageArgumentQuality,
    averageArgumentLength,
    totalArguments,
    participationRate,
    averageResponseTime,
    lastActive,
  };
}

export function calculateAgentPerformanceOverTime(
  agentId: string,
  debates: any[],
  period: TimePeriod = 'week'
): AgentPerformanceOverTime[] {
  // Group debates by time period
  const grouped: Record<string, any[]> = {};

  debates.forEach((debate) => {
    const date = new Date(debate.created_at);
    let key: string;

    switch (period) {
      case 'hour':
        key = date.toISOString().slice(0, 13) + ':00';
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      case 'year':
        key = date.toISOString().slice(0, 4);
        break;
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(debate);
  });

  // Calculate metrics for each period
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, periodDebates]) => {
      const wins = periodDebates.filter((d) => d.winner_agent_id === agentId).length;
      const losses = periodDebates.filter(
        (d) => d.status === 'completed' && d.winner_agent_id !== agentId
      ).length;
      const averageQuality = 75; // Placeholder

      return {
        date,
        debatesParticipated: periodDebates.length,
        wins,
        losses,
        averageQuality,
      };
    });
}

// ============================================================================
// Category Statistics Calculations
// ============================================================================

export function calculateCategoryStats(data: {
  category: string;
  debates: any[];
  votes: any[];
  arguments: any[];
}): CategoryStats {
  const { category, debates, votes, arguments: args } = data;

  const totalDebates = debates.length;
  const activeDebates = debates.filter((d) => d.status === 'active').length;
  const completedDebates = debates.filter((d) => d.status === 'completed').length;

  const debateIds = debates.map((d) => d.id);
  const categoryVotes = votes.filter((v) => debateIds.includes(v.debate_id));
  const categoryArgs = args.filter((a) => debateIds.includes(a.debate_id));

  const totalVotes = categoryVotes.length;
  const totalArguments = categoryArgs.length;

  // Calculate average duration
  const completedDebateDurations = debates
    .filter((d) => d.status === 'completed' && d.started_at && d.ended_at)
    .map((d) => {
      const start = new Date(d.started_at).getTime();
      const end = new Date(d.ended_at).getTime();
      return (end - start) / (1000 * 60);
    });

  const averageDuration =
    completedDebateDurations.length > 0
      ? completedDebateDurations.reduce((a, b) => a + b, 0) / completedDebateDurations.length
      : 0;

  // Get top agents (most wins in this category)
  const agentWins: Record<string, number> = {};
  debates.forEach((debate) => {
    if (debate.winner_agent_id) {
      agentWins[debate.winner_agent_id] = (agentWins[debate.winner_agent_id] || 0) + 1;
    }
  });

  const topAgents = Object.entries(agentWins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([agentId]) => agentId);

  // Determine if trending (recent activity spike)
  const recentDebates = debates.filter((d) => {
    const createdAt = new Date(d.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdAt > weekAgo;
  });

  const trending = recentDebates.length >= 5;

  return {
    category,
    totalDebates,
    activeDebates,
    completedDebates,
    totalVotes,
    totalArguments,
    averageDuration,
    topAgents,
    trending,
  };
}

// ============================================================================
// Time Series Data Generation
// ============================================================================

export function generateTimeSeriesData(
  data: any[],
  dateField: string,
  period: TimePeriod,
  startDate?: Date,
  endDate?: Date
): TimeSeriesData[] {
  const grouped: Record<string, number> = {};

  const start = startDate || new Date(Math.min(...data.map((d) => new Date(d[dateField]).getTime())));
  const end = endDate || new Date(Math.max(...data.map((d) => new Date(d[dateField]).getTime())));

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    let key: string;

    switch (period) {
      case 'hour':
        key = date.toISOString().slice(0, 13) + ':00';
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      case 'year':
        key = date.toISOString().slice(0, 4);
        break;
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  // Fill in missing periods
  const result: TimeSeriesData[] = [];
  let current = new Date(start);

  while (current <= end) {
    let key: string;

    switch (period) {
      case 'hour':
        key = current.toISOString().slice(0, 13) + ':00';
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        key = current.toISOString().slice(0, 10);
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        const weekStart = new Date(current);
        weekStart.setDate(current.getDate() - current.getDay());
        key = weekStart.toISOString().slice(0, 10);
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        key = current.toISOString().slice(0, 7);
        current.setMonth(current.getMonth() + 1);
        break;
      case 'year':
        key = current.toISOString().slice(0, 4);
        current.setFullYear(current.getFullYear() + 1);
        break;
    }

    result.push({
      period: key,
      value: grouped[key] || 0,
    });
  }

  return result;
}

// ============================================================================
// Formatting Functions
// ============================================================================

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return value.toFixed(decimals) + '%';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return Math.round(minutes) + 'm';
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

// ============================================================================
// Chart Data Formatting
// ============================================================================

export function formatForPieChart(data: { name: string; value: number }[]) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map((item) => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0,
  }));
}

export function formatForBarChart(data: { category: string; value: number }[]) {
  return data.map((item) => ({
    name: item.category,
    value: item.value,
  }));
}

export function formatForLineChart(data: TimeSeriesData[]) {
  return data.map((item) => ({
    name: item.period,
    value: item.value,
  }));
}

// ============================================================================
// Color Utilities
// ============================================================================

export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  for: '#10b981',
  against: '#ef4444',
  neutral: '#6b7280',
};

export function getColorForSide(side: DebateSide): string {
  return side === 'for' ? CHART_COLORS.for : CHART_COLORS.against;
}

export function getColorForIndex(index: number, colors: string[] = Object.values(CHART_COLORS)): string {
  return colors[index % colors.length];
}

// ============================================================================
// Validation Utilities
// ============================================================================

export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidPercentage(value: number): boolean {
  return value >= 0 && value <= 100;
}

// ============================================================================
// Aggregation Utilities
// ============================================================================

export function aggregateByPeriod<T>(
  data: T[],
  dateField: keyof T,
  valueField: keyof T,
  period: TimePeriod
): { period: string; value: number }[] {
  const grouped: Record<string, number> = {};

  data.forEach((item) => {
    const date = new Date(item[dateField] as any);
    let key: string;

    switch (period) {
      case 'hour':
        key = date.toISOString().slice(0, 13) + ':00';
        break;
      case 'day':
        key = date.toISOString().slice(0, 10);
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      case 'year':
        key = date.toISOString().slice(0, 4);
        break;
    }

    const value = item[valueField] as number;
    grouped[key] = (grouped[key] || 0) + (value || 0);
  });

  return Object.entries(grouped)
    .map(([period, value]) => ({ period, value }))
    .sort((a, b) => a.period.localeCompare(b.period));
}
