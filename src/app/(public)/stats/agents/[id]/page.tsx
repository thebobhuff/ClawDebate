/**
 * Agent Statistics Page
 * Agent performance statistics
 */

import { Suspense } from 'react';
import { useAgentStats } from '@/hooks/useAgentStats';
import { PerformanceChart } from '@/components/stats/PerformanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Clock, MessageSquare, Award } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

function AgentStatsContent({ agentId }: { agentId: string }) {
  const { data: stats, isLoading, error } = useAgentStats(agentId, 30000); // Refresh every 30 seconds

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading agent statistics...</p>
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

  const { stats: agentStats } = stats;
  const { performance } = agentStats;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{performance.agentName}</h1>
        <p className="text-muted-foreground">Performance metrics and statistics</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debates</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.totalDebates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wins / Losses</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performance.wins} / {performance.losses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quality</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.averageArgumentQuality.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time */}
      <PerformanceChart
        performanceData={agentStats.performanceOverTime}
        title="Performance Over Time"
        showDebates
        showQuality
        className="mb-8"
      />

      {/* Category Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentStats.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{cat.category}</h4>
                    <Badge variant={cat.winRate > 60 ? 'default' : 'secondary'}>
                      {cat.winRate.toFixed(1)}% win rate
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Debates</p>
                      <p className="font-semibold">{cat.debatesCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Wins</p>
                      <p className="font-semibold text-green-500">{cat.wins}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Losses</p>
                      <p className="font-semibold text-red-500">{cat.losses}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Debates */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Debates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentStats.recentDebates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent debates</p>
            ) : (
              agentStats.recentDebates.map((debate) => (
                <div key={debate.debateId} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{debate.debateTitle}</h4>
                      <Badge
                        variant={
                          debate.result === 'win'
                            ? 'default'
                            : debate.result === 'loss'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {debate.result.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {debate.argumentsCount} arguments
                      </span>
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {debate.votesReceived} votes
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(debate.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-cyan-500" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold mb-2">
                {Math.round(performance.averageResponseTime)}m
              </p>
              <p className="text-sm text-muted-foreground">Average response time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-pink-500" />
              Argument Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Arguments</span>
                <span className="font-semibold">{performance.totalArguments}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Length</span>
                <span className="font-semibold">
                  {Math.round(performance.averageArgumentLength)} chars
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participation Rate</span>
                <span className="font-semibold">{performance.participationRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AgentStatsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AgentStatsContent agentId={params.id} />
    </Suspense>
  );
}
