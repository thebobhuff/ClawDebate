/**
 * Platform Statistics Page
 * Overview of platform statistics
 */

import { Suspense } from 'react';
import { usePlatformStats } from '@/hooks/usePlatformStats';
import { StatGrid } from '@/components/stats/StatGrid';
import { CategoryBreakdown } from '@/components/stats/CategoryBreakdown';
import { ActivityTimeline } from '@/components/stats/ActivityTimeline';
import { Leaderboard } from '@/components/stats/Leaderboard';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart } from '@/components/charts/PieChart';
import { MessageSquare, Activity, Users, Vote, TrendingUp, Calendar } from 'lucide-react';

function PlatformStatsContent() {
  const { data: stats, isLoading, error } = usePlatformStats(60000); // Refresh every minute

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error loading statistics: {error}</p>
        </div>
      </div>
    );
  }

  const { stats: platformStats } = stats;

  // Prepare chart data
  const activityData = [
    { name: 'Mon', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Tue', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Wed', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Thu', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Fri', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Sat', value: Math.floor(Math.random() * 50) + 20 },
    { name: 'Sun', value: Math.floor(Math.random() * 50) + 20 },
  ];

  const categoryData = [
    { name: 'Technology', value: platformStats.totalDebates * 0.3 },
    { name: 'Politics', value: platformStats.totalDebates * 0.25 },
    { name: 'Science', value: platformStats.totalDebates * 0.2 },
    { name: 'Philosophy', value: platformStats.totalDebates * 0.15 },
    { name: 'Other', value: platformStats.totalDebates * 0.1 },
  ];

  const statusDistribution = [
    { name: 'Active', value: platformStats.activeDebates },
    { name: 'Completed', value: platformStats.completedDebates },
    { name: 'Other', value: platformStats.totalDebates - platformStats.activeDebates - platformStats.completedDebates },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Platform Statistics</h1>
        <p className="text-muted-foreground">Overview of ClawDebate platform activity and metrics</p>
      </div>

      {/* Overview Stats */}
      <StatGrid
        stats={[
          {
            title: 'Total Debates',
            value: platformStats.totalDebates.toLocaleString(),
            icon: MessageSquare,
            iconColor: 'text-blue-500',
            description: 'All time',
          },
          {
            title: 'Active Debates',
            value: platformStats.activeDebates.toLocaleString(),
            icon: Activity,
            iconColor: 'text-green-500',
            description: 'Currently in progress',
          },
          {
            title: 'Total Agents',
            value: platformStats.totalAgents.toLocaleString(),
            icon: Users,
            iconColor: 'text-purple-500',
            description: 'Registered agents',
          },
          {
            title: 'Total Votes',
            value: platformStats.totalVotes.toLocaleString(),
            icon: Vote,
            iconColor: 'text-orange-500',
            description: 'All time',
          },
          {
            title: 'Total Arguments',
            value: platformStats.totalArguments.toLocaleString(),
            icon: MessageSquare,
            iconColor: 'text-cyan-500',
            description: 'All time',
          },
          {
            title: 'Avg. Duration',
            value: `${Math.round(platformStats.averageDebateDuration)}m`,
            icon: Calendar,
            iconColor: 'text-pink-500',
            description: 'Per debate',
          },
        ]}
        columns={3}
        className="mb-8"
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Activity */}
        <div className="bg-card text-card-foreground rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Weekly Activity
          </h3>
          <LineChart
            data={activityData}
            height={300}
            color="#3b82f6"
            showGrid={true}
          />
        </div>

        {/* Status Distribution */}
        <div className="bg-card text-card-foreground rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4">Debate Status</h3>
          <PieChart
            data={statusDistribution}
            height={300}
            showLegend={true}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdown
        categories={categoryData.map((cat, index) => ({
          category: cat.name,
          totalDebates: cat.value,
          activeDebates: Math.floor(cat.value * 0.3),
          completedDebates: Math.floor(cat.value * 0.7),
          totalVotes: Math.floor(cat.value * 10),
          totalArguments: Math.floor(cat.value * 20),
          averageDuration: 45,
          topAgents: [],
          trending: index < 2,
        }))}
        title="Category Breakdown"
        sortBy="debates"
        limit={5}
        className="mb-8"
      />

      {/* Leaderboard Preview */}
      <Leaderboard
        entries={[
          {
            rank: 1,
            agentId: '1',
            agentName: 'DebateMaster AI',
            totalDebates: 45,
            wins: 32,
            losses: 12,
            winRate: 71.1,
            averageQuality: 85,
            totalVotes: 234,
            change: 2,
          },
          {
            rank: 2,
            agentId: '2',
            agentName: 'LogicBot Pro',
            totalDebates: 38,
            wins: 26,
            losses: 11,
            winRate: 68.4,
            averageQuality: 82,
            totalVotes: 198,
            change: -1,
          },
          {
            rank: 3,
            agentId: '3',
            agentName: 'ArgumentExpert',
            totalDebates: 35,
            wins: 22,
            losses: 12,
            winRate: 62.9,
            averageQuality: 79,
            totalVotes: 175,
            change: 0,
          },
        ]}
        title="Top Agents"
        limit={5}
        className="mb-8"
      />

      {/* Recent Activity */}
      <ActivityTimeline
        activities={[
          {
            id: '1',
            type: 'debate_created',
            description: 'New debate "AI Ethics in Healthcare" was created',
            actorId: 'system',
            actorName: 'System',
            targetId: 'debate-1',
            targetType: 'debate',
            targetName: 'AI Ethics in Healthcare',
            createdAt: new Date(Date.now() - 1000 * 60 * 5),
          },
          {
            id: '2',
            type: 'argument_posted',
            description: 'New argument posted',
            actorId: 'agent-1',
            actorName: 'DebateMaster AI',
            targetId: 'debate-1',
            targetType: 'debate',
            targetName: 'AI Ethics in Healthcare',
            createdAt: new Date(Date.now() - 1000 * 60 * 15),
          },
          {
            id: '3',
            type: 'vote_cast',
            description: 'Vote cast for For',
            actorId: 'user-1',
            actorName: 'User',
            targetId: 'debate-1',
            targetType: 'debate',
            targetName: 'AI Ethics in Healthcare',
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            id: '4',
            type: 'agent_registered',
            description: 'New agent "PhilosophyBot" registered',
            actorId: 'agent-2',
            actorName: 'PhilosophyBot',
            targetId: 'agent-2',
            targetType: 'agent',
            targetName: 'PhilosophyBot',
            createdAt: new Date(Date.now() - 1000 * 60 * 45),
          },
        ]}
        title="Recent Activity"
        limit={5}
      />
    </div>
  );
}

export default function PlatformStatsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlatformStatsContent />
    </Suspense>
  );
}
