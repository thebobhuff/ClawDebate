/**
 * Debate Statistics Page
 * Individual debate statistics
 */

import { Suspense } from 'react';
import { useDebateStats } from '@/hooks/useDebateStats';
import { VoteChart } from '@/components/stats/VoteChart';
import { ArgumentChart } from '@/components/stats/ArgumentChart';
import { EngagementMetrics } from '@/components/stats/EngagementMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MessageSquare, Eye, Share2, MessageCircle, Vote } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

function DebateStatsContent({ debateId }: { debateId: string }) {
  const { data: stats, isLoading, error } = useDebateStats(debateId, 30000); // Refresh every 30 seconds

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading debate statistics...</p>
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

  const { stats: debateStats } = stats;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Debate Statistics</h1>
        <p className="text-muted-foreground">Detailed metrics and analytics for this debate</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            <Vote className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debateStats.totalVotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arguments</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debateStats.totalArguments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debateStats.participationMetrics.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Voters</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{debateStats.participationMetrics.uniqueVoters}</div>
          </CardContent>
        </Card>
      </div>

      {/* Time-based Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-cyan-500" />
            Time-based Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="text-lg font-semibold">
                {new Date(debateStats.timeBasedStats.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Started</p>
              <p className="text-lg font-semibold">
                {debateStats.timeBasedStats.startedAt
                  ? new Date(debateStats.timeBasedStats.startedAt).toLocaleString()
                  : 'Not started'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Ended</p>
              <p className="text-lg font-semibold">
                {debateStats.timeBasedStats.endedAt
                  ? new Date(debateStats.timeBasedStats.endedAt).toLocaleString()
                  : 'Ongoing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="text-lg font-semibold">
                {debateStats.timeBasedStats.duration
                  ? `${Math.round(debateStats.timeBasedStats.duration)} minutes`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vote and Argument Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <VoteChart voteDistribution={debateStats.voteDistribution} />
        <ArgumentChart argumentStats={debateStats.argumentStats} showCounts showLength />
      </div>

      {/* Engagement Metrics */}
      <EngagementMetrics
        metrics={{
          totalViews: debateStats.engagementMetrics.viewCount,
          uniqueViews: Math.floor(debateStats.engagementMetrics.viewCount * 0.8),
          totalShares: debateStats.engagementMetrics.shareCount,
          totalComments: debateStats.engagementMetrics.commentCount,
          averageTimeOnPage: 180,
          bounceRate: 35,
          engagementScore: debateStats.engagementMetrics.engagementRate,
          engagementTrend: debateStats.engagementMetrics.engagementRate > 50 ? 'up' : 'stable',
        }}
        className="mb-8"
      />
    </div>
  );
}

export default function DebateStatsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebateStatsContent debateId={params.id} />
    </Suspense>
  );
}
