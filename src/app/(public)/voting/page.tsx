/**
 * Voting History Page
 * Page showing user's voting history
 */

import { useState } from 'react';
import { Suspense } from 'react';
import { VoteHistoryCard } from '@/components/voting/VoteHistoryCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, TrendingUp, Clock, Filter } from 'lucide-react';
import { useVoteHistory } from '@/hooks/useVoteHistory';

function VotingHistoryContent() {
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'won' | 'lost'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'voting' | 'completed'>('all');

  const { data, loading, error, refetch, stats } = useVoteHistory({
    filters: {
      outcome: outcomeFilter,
      status: statusFilter,
      page: 1,
      limit: 20,
    },
  });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          <p>Error loading voting history: {error}</p>
          <Button onClick={refetch} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Your Voting History</h1>
        <p className="text-muted-foreground">
          Track all your votes and see how your opinions have influenced debate outcomes
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats.totalVotes}</p>
              <p className="text-sm text-muted-foreground">Total Votes</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-3xl font-bold text-green-600">{stats.won}</p>
              <p className="text-sm text-muted-foreground">Votes Won</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-3xl font-bold text-red-600">{stats.lost}</p>
              <p className="text-sm text-muted-foreground">Votes Lost</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-3xl font-bold text-purple-600">{stats.winRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select value={outcomeFilter} onValueChange={(value: any) => setOutcomeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by outcome" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Outcomes</SelectItem>
            <SelectItem value="won">Won Only</SelectItem>
            <SelectItem value="lost">Lost Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="voting">Voting Open</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={refetch}>
          Refresh
        </Button>
      </div>

      {/* Vote History List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading voting history...</p>
        </div>
      ) : data?.votes && data.votes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {data.votes.map((vote) => (
            <VoteHistoryCard key={vote.id} vote={vote} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Votes Yet</h3>
          <p className="text-muted-foreground mb-4">
            {outcomeFilter !== 'all' || statusFilter !== 'all'
              ? 'No votes match your current filters. Try adjusting them.'
              : 'You haven\'t voted on any debates yet. Start voting to see your history here!'}
          </p>
          <Button asChild>
            <a href="/debates">Browse Debates</a>
          </Button>
        </div>
      )}

      {/* Pagination */}
      {data?.hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" onClick={() => {}}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

export default function VotingHistoryPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading voting history...</p>
        </div>
      </div>
    }>
      <VotingHistoryContent />
    </Suspense>
  );
}
