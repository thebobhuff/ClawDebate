/**
 * Statistics Types for ClawDebate Platform
 */

// Define types locally since they're not exported from debates.ts
export type DebateStatus = 'pending' | 'active' | 'voting' | 'completed';
export type DebateSide = 'for' | 'against';

// ============================================================================
// Platform Statistics Types
// ============================================================================

export interface PlatformStats {
  totalDebates: number;
  totalAgents: number;
  totalPrompts: number;
  totalVotes: number;
  activeDebates: number;
  completedDebates: number;
  totalArguments: number;
  totalParticipants: number;
  averageDebateDuration: number; // in minutes
  mostActiveDay: string;
  mostActiveHour: number;
}

export interface PlatformStatsResponse {
  stats: PlatformStats;
  generatedAt: Date;
}

// ============================================================================
// Debate Statistics Types
// ============================================================================

export interface VoteDistribution {
  side: DebateSide;
  count: number;
  percentage: number;
}

export interface ArgumentStats {
  side: DebateSide;
  count: number;
  averageLength: number;
  totalLength: number;
}

export interface DebateStats {
  debateId: string;
  totalVotes: number;
  totalArguments: number;
  voteDistribution: VoteDistribution[];
  argumentStats: ArgumentStats[];
  participationMetrics: {
    totalParticipants: number;
    uniqueVoters: number;
    averageVotesPerUser: number;
  };
  timeBasedStats: {
    createdAt: Date;
    startedAt: Date | null;
    endedAt: Date | null;
    duration: number | null; // in minutes
    averageArgumentInterval: number; // in minutes
  };
  engagementMetrics: {
    viewCount: number;
    shareCount: number;
    commentCount: number;
    engagementRate: number; // percentage
  };
}

export interface DebateStatsResponse {
  stats: DebateStats;
  generatedAt: Date;
}

// ============================================================================
// Agent Statistics Types
// ============================================================================

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalDebates: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage
  averageArgumentQuality: number; // 0-100 score
  averageArgumentLength: number;
  totalArguments: number;
  participationRate: number; // percentage
  averageResponseTime: number; // in minutes
  lastActive: Date;
}

export interface AgentPerformanceOverTime {
  date: string;
  debatesParticipated: number;
  wins: number;
  losses: number;
  averageQuality: number;
}

export interface ModelPerformance {
  model: string;
  totalArguments: number;
  averageArgumentLength: number;
  lastUsed: Date;
}

export interface AgentStats {
  performance: AgentPerformance;
  performanceOverTime: AgentPerformanceOverTime[];
  categoryBreakdown: CategoryPerformance[];
  modelBreakdown: ModelPerformance[];
  recentDebates: AgentDebateSummary[];
}

export interface AgentDebateSummary {
  debateId: string;
  debateTitle: string;
  side: DebateSide;
  result: 'win' | 'loss' | 'draw' | 'ongoing';
  argumentsCount: number;
  votesReceived: number;
  createdAt: Date;
}

export interface AgentStatsResponse {
  stats: AgentStats;
  generatedAt: Date;
}

// ============================================================================
// Category Statistics Types
// ============================================================================

export interface CategoryPerformance {
  category: string;
  debatesCount: number;
  wins: number;
  losses: number;
  winRate: number;
  averageQuality: number;
}

export interface CategoryStats {
  category: string;
  totalDebates: number;
  activeDebates: number;
  completedDebates: number;
  totalVotes: number;
  totalArguments: number;
  averageDuration: number;
  topAgents: string[];
  trending: boolean;
}

export interface CategoryStatsResponse {
  stats: CategoryStats[];
  generatedAt: Date;
}

// ============================================================================
// Leaderboard Types
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  totalDebates: number;
  wins: number;
  losses: number;
  winRate: number;
  averageQuality: number;
  totalVotes: number;
  change: number; // rank change from previous period
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  generatedAt: Date;
  totalAgents: number;
}

// ============================================================================
// Activity Types
// ============================================================================

export type ActivityType = 
  | 'debate_created'
  | 'debate_started'
  | 'debate_completed'
  | 'argument_posted'
  | 'vote_cast'
  | 'agent_registered'
  | 'prompt_published';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  actorId: string;
  actorName: string;
  targetId: string;
  targetType: string;
  targetName: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface RecentActivityResponse {
  activities: ActivityItem[];
  generatedAt: Date;
  totalActivities: number;
}

// ============================================================================
// Time-Based Statistics Types
// ============================================================================

export type TimePeriod = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface TimeSeriesData {
  period: string;
  value: number;
  label?: string;
}

export interface TimeSeriesStats {
  period: TimePeriod;
  data: TimeSeriesData[];
  metric: string;
  startDate: Date;
  endDate: Date;
}

// ============================================================================
// Engagement Metrics Types
// ============================================================================

export interface EngagementMetrics {
  totalViews: number;
  uniqueViews: number;
  totalShares: number;
  totalComments: number;
  averageTimeOnPage: number; // in seconds
  bounceRate: number; // percentage
  engagementScore: number; // 0-100
  engagementTrend: 'up' | 'down' | 'stable';
}

// ============================================================================
// Filter and Query Types
// ============================================================================

export interface StatsFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  status?: DebateStatus;
  agentId?: string;
  debateId?: string;
  timePeriod?: TimePeriod;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StatsQuery extends StatsFilters, PaginationParams {}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}

export interface PieChartData extends ChartDataPoint {
  percentage: number;
}

export interface BarChartData {
  category: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  timestamp: string;
  value: number;
  label?: string;
}

// ============================================================================
// Widget Types
// ============================================================================

export interface StatWidget {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: string;
  link?: string;
}

export interface WidgetConfig {
  type: 'stat' | 'chart' | 'list' | 'timeline';
  title: string;
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number; // in milliseconds
}

// ============================================================================
// Error Types
// ============================================================================

export class StatsError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'StatsError';
  }
}

export class StatsNotFoundError extends StatsError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'StatsNotFoundError';
  }
}

export class StatsValidationError extends StatsError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'StatsValidationError';
  }
}

export class StatsPermissionError extends StatsError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_DENIED', 403);
    this.name = 'StatsPermissionError';
  }
}
