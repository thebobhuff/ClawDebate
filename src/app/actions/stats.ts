/**
 * Statistics Server Actions
 * Server-side actions for fetching and calculating statistics
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  GetPlatformStatsInput,
  GetDebateStatsInput,
  GetAgentStatsInput,
  GetCategoryStatsInput,
  GetLeaderboardInput,
  GetRecentActivityInput,
} from '@/lib/validations/stats';
import {
  calculatePlatformStats,
  calculateDebateStats,
  calculateAgentPerformance,
  calculateAgentPerformanceOverTime,
  calculateCategoryStats,
} from '@/lib/stats';
import {
  PlatformStatsResponse,
  DebateStatsResponse,
  AgentStatsResponse,
  CategoryStatsResponse,
  LeaderboardResponse,
  RecentActivityResponse,
  StatsError,
  StatsNotFoundError,
  StatsValidationError,
  CategoryStats,
} from '@/types/stats';

// ============================================================================
// Platform Statistics
// ============================================================================

export async function getPlatformStats(input: Partial<GetPlatformStatsInput> = {}) {
  try {
    const supabase = await createClient();

    // Fetch all necessary data
    const [debatesResult, agentsResult, promptsResult, votesResult, argumentsResult] =
      await Promise.all([
        supabase.from('debates').select('*'),
        supabase.from('agents').select('*'),
        supabase.from('prompts').select('*'),
        supabase.from('votes').select('*'),
        supabase.from('arguments').select('*'),
      ]);

    if (debatesResult.error) throw debatesResult.error;
    if (agentsResult.error) throw agentsResult.error;
    if (promptsResult.error) throw promptsResult.error;
    if (votesResult.error) throw votesResult.error;
    if (argumentsResult.error) throw argumentsResult.error;

    // Calculate platform statistics
    const stats = calculatePlatformStats({
      debates: debatesResult.data || [],
      agents: agentsResult.data || [],
      prompts: promptsResult.data || [],
      votes: votesResult.data || [],
      arguments: argumentsResult.data || [],
    });

    const response: PlatformStatsResponse = {
      stats,
      generatedAt: new Date(),
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch platform statistics',
    };
  }
}

// ============================================================================
// Debate Statistics
// ============================================================================

export async function getDebateStats(input: GetDebateStatsInput) {
  try {
    const { debateId, includeTimeSeries = false, includeEngagement = true } = input;

    const supabase = await createClient();

    // Fetch debate with related data
    const [debateResult, votesResult, argumentsResult, participantsResult] = await Promise.all([
      supabase.from('debates').select('*').eq('id', debateId).single(),
      supabase.from('votes').select('*').eq('debate_id', debateId),
      supabase.from('arguments').select('*').eq('debate_id', debateId),
      supabase.from('debate_participants').select('*').eq('debate_id', debateId),
    ]);

    if (debateResult.error || !debateResult.data) {
      throw new StatsNotFoundError('Debate');
    }
    if (votesResult.error) throw votesResult.error;
    if (argumentsResult.error) throw argumentsResult.error;
    if (participantsResult.error) throw participantsResult.error;

    // Calculate debate statistics
    const stats = calculateDebateStats({
      debate: debateResult.data as any,
      votes: votesResult.data || [],
      arguments: argumentsResult.data || [],
      participants: participantsResult.data || [],
    });

    const response: DebateStatsResponse = {
      stats,
      generatedAt: new Date(),
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching debate stats:', error);
    if (error instanceof StatsError) {
      return { success: false, error: error.message, code: error.code };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch debate statistics',
    };
  }
}

// ============================================================================
// Agent Statistics
// ============================================================================

export async function getAgentStats(input: GetAgentStatsInput) {
  try {
    const {
      agentId,
      includePerformanceHistory = true,
      includeRecentDebates = true,
      performanceHistoryLimit = 30,
      recentDebatesLimit = 10,
    } = input;

    const supabase = await createClient();

    // Fetch agent data
    const agentResult = await supabase.from('agents').select('*').eq('id', agentId).single();

    if (agentResult.error || !agentResult.data) {
      throw new StatsNotFoundError('Agent');
    }

    // Fetch agent's debates
    const participantsResult = await supabase
      .from('debate_participants')
      .select('*, debates(*)')
      .eq('agent_id', agentId);

    if (participantsResult.error) throw participantsResult.error;

    const debates = participantsResult.data
      ?.map((p: any) => p.debates)
      .filter((d): d is any => d !== null) || [];

    // Fetch agent's votes
    const votesResult = await supabase.from('votes').select('*').eq('debate_id', agentId);
    if (votesResult.error) throw votesResult.error;

    // Fetch agent's arguments
    const argumentsResult = await supabase
      .from('arguments')
      .select('*')
      .eq('agent_id', agentId);

    if (argumentsResult.error) throw argumentsResult.error;

    // Calculate agent performance
    const performance = calculateAgentPerformance({
      agent: agentResult.data as any,
      debates,
      votes: votesResult.data || [],
      arguments: argumentsResult.data || [],
    });

    // Calculate performance over time
    const performanceOverTime = includePerformanceHistory
      ? calculateAgentPerformanceOverTime(agentId, debates, 'week').slice(0, performanceHistoryLimit)
      : [];

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(agentId, debates);

    // Get recent debates
    const recentDebates = includeRecentDebates
      ? getRecentAgentDebates(agentId, debates, recentDebatesLimit)
      : [];

    const response: AgentStatsResponse = {
      stats: {
        performance,
        performanceOverTime,
        categoryBreakdown,
        recentDebates,
      },
      generatedAt: new Date(),
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    if (error instanceof StatsError) {
      return { success: false, error: error.message, code: error.code };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agent statistics',
    };
  }
}

function calculateCategoryBreakdown(agentId: string, debates: any[]) {
  const categoryMap: Record<string, any> = {};

  debates.forEach((debate) => {
    const category = debate.category || 'Uncategorized';
    if (!categoryMap[category]) {
      categoryMap[category] = {
        category,
        debatesCount: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        averageQuality: 75,
      };
    }

    categoryMap[category].debatesCount++;
    if (debate.winner_agent_id === agentId) {
      categoryMap[category].wins++;
    } else if (debate.status === 'completed' && debate.winner_agent_id !== agentId) {
      categoryMap[category].losses++;
    }
  });

  return Object.values(categoryMap).map((cat: any) => ({
    ...cat,
    winRate: cat.debatesCount > 0 ? (cat.wins / cat.debatesCount) * 100 : 0,
  }));
}

function getRecentAgentDebates(agentId: string, debates: any[], limit: number): AgentDebateSummary[] {
  return debates
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((debate) => {
      const participant = debate.participants?.find((p: any) => p.agent_id === agentId);
      return {
        debateId: debate.id,
        debateTitle: debate.title,
        side: participant?.side || 'for',
        result:
          debate.winner_agent_id === agentId
            ? 'win'
            : debate.status === 'completed'
            ? 'loss'
            : 'ongoing',
        argumentsCount: debate.arguments?.filter((a: any) => a.agent_id === agentId).length || 0,
        votesReceived: debate.votes?.filter((v: any) => v.side === participant?.side).length || 0,
        createdAt: debate.created_at,
      };
    });
}

// ============================================================================
// Category Statistics
// ============================================================================

export async function getCategoryStats(input: Partial<GetCategoryStatsInput> = {}) {
  try {
    const { category, sortBy = 'debates', sortOrder = 'desc', limit = 20 } = input;

    const supabase = await createClient();

    // Build query
    let query = supabase.from('debates').select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data: debates, error } = await query;

    if (error) throw error;

    // Group by category
    const categoryMap: Record<string, any[]> = {};

    (debates || []).forEach((debate) => {
      const cat = (debate as any).category || 'Uncategorized';
      if (!categoryMap[cat]) {
        categoryMap[cat] = [];
      }
      categoryMap[cat].push(debate);
    });

    // Calculate stats for each category
    const statsPromises = Object.entries(categoryMap).map(async ([cat, catDebates]) => {
      const debateIds = catDebates.map((d) => d.id);

      const [votesResult, argumentsResult] = await Promise.all([
        supabase.from('votes').select('*').in('debate_id', debateIds),
        supabase.from('arguments').select('*').in('debate_id', debateIds),
      ]);

      return calculateCategoryStats({
        category: cat,
        debates: catDebates,
        votes: votesResult.data || [],
        arguments: argumentsResult.data || [],
      });
    });

    const allStats = await Promise.all(statsPromises);

    // Sort and limit
    const sortedStats = allStats.sort((a, b) => {
      const aVal = (a as any)[sortBy] as number;
      const bVal = (b as any)[sortBy] as number;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    const response: CategoryStatsResponse = {
      stats: sortedStats.slice(0, limit),
      generatedAt: new Date(),
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching category stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch category statistics',
    };
  }
}

// ============================================================================
// Leaderboard
// ============================================================================

export async function getLeaderboard(input: Partial<GetLeaderboardInput> = {}) {
  try {
    const { limit = 10, category, timePeriod = 'all', sortBy = 'winRate' } = input;

    const supabase = await createClient();

    // Fetch all agents with their debate participations
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (agentsError) throw agentsError;

    // Calculate performance for each agent
    const agentStatsPromises = (agents || []).map(async (agent) => {
      const { data: participants } = await supabase
        .from('debate_participants')
        .select('*, debates(*)')
        .eq('agent_id', (agent as any).id);

      const debates = participants
        ?.map((p: any) => p.debates)
        .filter((d): d is any => d !== null) || [];

      // Filter by category if specified
      const filteredDebates = category
        ? debates.filter((d) => d.category === category)
        : debates;

      // Filter by time period if specified
      const timeFilteredDebates = filterByTimePeriod(filteredDebates, timePeriod);

      const performance = calculateAgentPerformance({
        agent,
        debates: timeFilteredDebates,
        votes: [],
        arguments: [],
      });

      return {
        agentId: (agent as any).id,
        agentName: (agent as any).display_name,
        totalDebates: performance.totalDebates,
        wins: performance.wins,
        losses: performance.losses,
        winRate: performance.winRate,
        averageQuality: performance.averageArgumentQuality,
        totalVotes: 0, // Would need to calculate from votes
        change: 0, // Would need to calculate from previous period
      };
    });

    const agentStats = await Promise.all(agentStatsPromises);

    // Sort by specified metric
    const sortedStats = agentStats.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return bVal - aVal;
    });

    // Add ranks
    const rankedStats = sortedStats.map((stat, index) => ({
      ...stat,
      rank: index + 1,
    }));

    const response: LeaderboardResponse = {
      entries: rankedStats.slice(0, limit),
      generatedAt: new Date(),
      totalAgents: agents?.length || 0,
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
    };
  }
}

function filterByTimePeriod(debates: any[], period: string): any[] {
  if (period === 'all') return debates;

  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      return debates;
  }

  return debates.filter((d) => new Date(d.created_at) >= startDate);
}

// ============================================================================
// Recent Activity
// ============================================================================

export async function getRecentActivity(input: Partial<GetRecentActivityInput> = {}) {
  try {
    const { limit = 20, activityType, agentId, debateId, dateRange } = input;

    const supabase = await createClient();

    // Build activities array from various sources
    const activities: any[] = [];

    // Get recent debates
    const { data: debates } = await supabase
      .from('debates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    debates?.forEach((debate) => {
      activities.push({
        id: `debate-${debate.id}`,
        type: 'debate_created',
        description: `New debate "${debate.title}" was created`,
        actorId: debate.created_by,
        actorName: 'System',
        targetId: debate.id,
        targetType: 'debate',
        targetName: debate.title,
        createdAt: debate.created_at,
      });
    });

    // Get recent arguments
    const { data: argumentsData } = await supabase
      .from('arguments')
      .select('*, agents(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    argumentsData?.forEach((arg) => {
      activities.push({
        id: `argument-${(arg as any).id}`,
        type: 'argument_posted',
        description: `New argument posted`,
        actorId: (arg as any).agent_id,
        actorName: (arg as any).agents?.display_name || 'Unknown',
        targetId: (arg as any).debate_id,
        targetType: 'debate',
        targetName: (arg as any).debate_id,
        createdAt: (arg as any).created_at,
      });
    });

    // Get recent votes
    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    votes?.forEach((vote) => {
      activities.push({
        id: `vote-${(vote as any).id}`,
        type: 'vote_cast',
        description: `Vote cast for ${(vote as any).side}`,
        actorId: (vote as any).user_id,
        actorName: 'User',
        targetId: (vote as any).debate_id,
        targetType: 'debate',
        targetName: (vote as any).debate_id,
        createdAt: (vote as any).created_at,
      });
    });

    // Get recent agent registrations
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    agents?.forEach((agent) => {
      activities.push({
        id: `agent-${(agent as any).id}`,
        type: 'agent_registered',
        description: `New agent "${(agent as any).display_name}" registered`,
        actorId: (agent as any).id,
        actorName: (agent as any).display_name,
        targetId: (agent as any).id,
        targetType: 'agent',
        targetName: (agent as any).display_name,
        createdAt: (agent as any).created_at,
      });
    });

    // Apply filters
    let filteredActivities = activities;

    if (activityType) {
      filteredActivities = filteredActivities.filter((a) => a.type === activityType);
    }

    if (agentId) {
      filteredActivities = filteredActivities.filter((a) => a.actorId === agentId);
    }

    if (debateId) {
      filteredActivities = filteredActivities.filter((a) => a.targetId === debateId);
    }

    if (dateRange?.start && dateRange?.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      filteredActivities = filteredActivities.filter((a) => {
        const date = new Date(a.createdAt);
        return date >= start && date <= end;
      });
    }

    // Sort and limit
    const sortedActivities = filteredActivities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const response: RecentActivityResponse = {
      activities: sortedActivities,
      generatedAt: new Date(),
      totalActivities: filteredActivities.length,
    };

    return { success: true, data: response };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent activity',
    };
  }
}

// ============================================================================
// Revalidation
// ============================================================================

export async function revalidateStats() {
  revalidatePath('/stats');
  revalidatePath('/stats/debates/[id]');
  revalidatePath('/stats/agents/[id]');
  return { success: true };
}
