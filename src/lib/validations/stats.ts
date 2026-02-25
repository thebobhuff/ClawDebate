/**
 * Validation Schemas for Statistics
 * Zod schemas for validating statistics-related inputs
 */

import { z } from 'zod';
import { DebateStatus, DebateSide, TimePeriod, ActivityType } from '@/types/stats';

// ============================================================================
// Platform Stats Schemas
// ============================================================================

export const GetPlatformStatsSchema = z.object({
  includeTimeSeries: z.boolean().optional().default(false),
  timePeriod: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
});

export type GetPlatformStatsInput = z.infer<typeof GetPlatformStatsSchema>;

// ============================================================================
// Debate Stats Schemas
// ============================================================================

export const GetDebateStatsSchema = z.object({
  debateId: z.string().uuid('Invalid debate ID'),
  includeTimeSeries: z.boolean().optional().default(false),
  includeEngagement: z.boolean().optional().default(true),
});

export type GetDebateStatsInput = z.infer<typeof GetDebateStatsSchema>;

// ============================================================================
// Agent Stats Schemas
// ============================================================================

export const GetAgentStatsSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  includePerformanceHistory: z.boolean().optional().default(true),
  includeRecentDebates: z.boolean().optional().default(true),
  performanceHistoryLimit: z.number().min(1).max(100).optional().default(30),
  recentDebatesLimit: z.number().min(1).max(50).optional().default(10),
});

export type GetAgentStatsInput = z.infer<typeof GetAgentStatsSchema>;

// ============================================================================
// Category Stats Schemas
// ============================================================================

export const GetCategoryStatsSchema = z.object({
  category: z.string().min(1).optional(),
  sortBy: z.enum(['debates', 'votes', 'arguments', 'duration']).optional().default('debates'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  limit: z.number().min(1).max(100).optional().default(20),
});

export type GetCategoryStatsInput = z.infer<typeof GetCategoryStatsSchema>;

// ============================================================================
// Leaderboard Schemas
// ============================================================================

export const GetLeaderboardSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  category: z.string().min(1).optional(),
  timePeriod: z.enum(['week', 'month', 'year', 'all']).optional().default('all'),
  sortBy: z.enum(['winRate', 'totalDebates', 'averageQuality', 'totalVotes']).optional().default('winRate'),
});

export type GetLeaderboardInput = z.infer<typeof GetLeaderboardSchema>;

// ============================================================================
// Activity Schemas
// ============================================================================

export const GetRecentActivitySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  activityType: z.enum([
    'debate_created',
    'debate_started',
    'debate_completed',
    'argument_posted',
    'vote_cast',
    'agent_registered',
    'prompt_published',
  ]).optional(),
  agentId: z.string().uuid().optional(),
  debateId: z.string().uuid().optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
});

export type GetRecentActivityInput = z.infer<typeof GetRecentActivitySchema>;

// ============================================================================
// Filter Schemas
// ============================================================================

export const StatsFiltersSchema = z.object({
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  category: z.string().min(1).optional(),
  status: z.enum(['pending', 'active', 'voting', 'completed']).optional(),
  agentId: z.string().uuid().optional(),
  debateId: z.string().uuid().optional(),
  timePeriod: z.enum(['hour', 'day', 'week', 'month', 'year']).optional(),
});

export type StatsFiltersInput = z.infer<typeof StatsFiltersSchema>;

// ============================================================================
// Pagination Schemas
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// ============================================================================
// Combined Query Schema
// ============================================================================

export const StatsQuerySchema = StatsFiltersSchema.merge(PaginationSchema);

export type StatsQueryInput = z.infer<typeof StatsQuerySchema>;

// ============================================================================
// Time Series Schema
// ============================================================================

export const TimeSeriesQuerySchema = z.object({
  metric: z.enum([
    'debates',
    'votes',
    'arguments',
    'agents',
    'participants',
    'engagement',
  ]),
  period: z.enum(['hour', 'day', 'week', 'month', 'year']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

export type TimeSeriesQueryInput = z.infer<typeof TimeSeriesQuerySchema>;

// ============================================================================
// Comparison Schema
// ============================================================================

export const ComparisonQuerySchema = z.object({
  type: z.enum(['agent', 'debate', 'category']),
  ids: z.array(z.string().uuid()).min(1).max(10),
  metrics: z.array(z.string()).min(1),
});

export type ComparisonQueryInput = z.infer<typeof ComparisonQuerySchema>;

// ============================================================================
// Export Schema
// ============================================================================

export const ExportStatsSchema = z.object({
  format: z.enum(['json', 'csv', 'xlsx']),
  includeCharts: z.boolean().optional().default(false),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).optional(),
  filters: StatsFiltersSchema.optional(),
});

export type ExportStatsInput = z.infer<typeof ExportStatsSchema>;

// ============================================================================
// Widget Config Schema
// ============================================================================

export const WidgetConfigSchema = z.object({
  type: z.enum(['stat', 'chart', 'list', 'timeline']),
  title: z.string().min(1).max(100),
  size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
  refreshInterval: z.number().min(5000).max(3600000).optional(), // 5 seconds to 1 hour
  config: z.record(z.any()).optional(),
});

export type WidgetConfigInput = z.infer<typeof WidgetConfigSchema>;

// ============================================================================
// Response Schemas
// ============================================================================

export const PlatformStatsResponseSchema = z.object({
  stats: z.object({
    totalDebates: z.number(),
    totalAgents: z.number(),
    totalPrompts: z.number(),
    totalVotes: z.number(),
    activeDebates: z.number(),
    completedDebates: z.number(),
    totalArguments: z.number(),
    totalParticipants: z.number(),
    averageDebateDuration: z.number(),
    mostActiveDay: z.string(),
    mostActiveHour: z.number(),
  }),
  generatedAt: z.string().datetime(),
});

export const DebateStatsResponseSchema = z.object({
  stats: z.object({
    debateId: z.string().uuid(),
    totalVotes: z.number(),
    totalArguments: z.number(),
    voteDistribution: z.array(z.object({
      side: z.enum(['for', 'against']),
      count: z.number(),
      percentage: z.number(),
    })),
    argumentStats: z.array(z.object({
      side: z.enum(['for', 'against']),
      count: z.number(),
      averageLength: z.number(),
      totalLength: z.number(),
    })),
    participationMetrics: z.object({
      totalParticipants: z.number(),
      uniqueVoters: z.number(),
      averageVotesPerUser: z.number(),
    }),
    timeBasedStats: z.object({
      createdAt: z.string().datetime(),
      startedAt: z.string().datetime().nullable(),
      endedAt: z.string().datetime().nullable(),
      duration: z.number().nullable(),
      averageArgumentInterval: z.number(),
    }),
    engagementMetrics: z.object({
      viewCount: z.number(),
      shareCount: z.number(),
      commentCount: z.number(),
      engagementRate: z.number(),
    }),
  }),
  generatedAt: z.string().datetime(),
});

export const AgentStatsResponseSchema = z.object({
  stats: z.object({
    performance: z.object({
      agentId: z.string().uuid(),
      agentName: z.string(),
      totalDebates: z.number(),
      wins: z.number(),
      losses: z.number(),
      draws: z.number(),
      winRate: z.number(),
      averageArgumentQuality: z.number(),
      averageArgumentLength: z.number(),
      totalArguments: z.number(),
      participationRate: z.number(),
      averageResponseTime: z.number(),
      lastActive: z.string().datetime(),
    }),
    performanceOverTime: z.array(z.object({
      date: z.string(),
      debatesParticipated: z.number(),
      wins: z.number(),
      losses: z.number(),
      averageQuality: z.number(),
    })),
    categoryBreakdown: z.array(z.object({
      category: z.string(),
      debatesCount: z.number(),
      wins: z.number(),
      losses: z.number(),
      winRate: z.number(),
      averageQuality: z.number(),
    })),
    modelBreakdown: z.array(z.object({
      model: z.string(),
      totalArguments: z.number(),
      averageArgumentLength: z.number(),
      lastUsed: z.string().datetime(),
    })),
    recentDebates: z.array(z.object({
      debateId: z.string().uuid(),
      debateTitle: z.string(),
      side: z.enum(['for', 'against']),
      result: z.enum(['win', 'loss', 'draw', 'ongoing']),
      argumentsCount: z.number(),
      votesReceived: z.number(),
      createdAt: z.string().datetime(),
    })),
  }),
  generatedAt: z.string().datetime(),
});

export const LeaderboardResponseSchema = z.object({
  entries: z.array(z.object({
    rank: z.number(),
    agentId: z.string().uuid(),
    agentName: z.string(),
    totalDebates: z.number(),
    wins: z.number(),
    losses: z.number(),
    winRate: z.number(),
    averageQuality: z.number(),
    totalVotes: z.number(),
    change: z.number(),
  })),
  generatedAt: z.string().datetime(),
  totalAgents: z.number(),
});

export const RecentActivityResponseSchema = z.object({
  activities: z.array(z.object({
    id: z.string(),
    type: z.enum([
      'debate_created',
      'debate_started',
      'debate_completed',
      'argument_posted',
      'vote_cast',
      'agent_registered',
      'prompt_published',
    ]),
    description: z.string(),
    actorId: z.string().uuid(),
    actorName: z.string(),
    targetId: z.string(),
    targetType: z.string(),
    targetName: z.string(),
    metadata: z.record(z.any()).optional(),
    createdAt: z.string().datetime(),
  })),
  generatedAt: z.string().datetime(),
  totalActivities: z.number(),
});
