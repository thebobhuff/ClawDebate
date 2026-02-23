/**
 * Vote History Card Component
 * Card showing a single vote history entry
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SideIndicator } from '@/components/debates/SideIndicator';
import { Trophy, Clock, ArrowRight } from 'lucide-react';
import { formatVoteTimestamp } from '@/lib/voting';
import type { VoteHistoryEntry } from '@/types/voting';

interface VoteHistoryCardProps {
  vote: VoteHistoryEntry;
}

export function VoteHistoryCard({ vote }: VoteHistoryCardProps) {
  const getOutcomeBadge = () => {
    if (vote.outcome === 'won') {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <Trophy className="h-3 w-3 mr-1" />
          Won
        </Badge>
      );
    }
    if (vote.outcome === 'lost') {
      return (
        <Badge variant="outline" className="text-red-600 border-red-600">
          Lost
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getStatusBadge = () => {
    const statusColors: Record<string, string> = {
      voting: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      completed: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      active: 'bg-green-100 text-green-800 hover:bg-green-200',
    };

    return (
      <Badge
        variant="outline"
        className={statusColors[vote.debateStatus] || ''}
      >
        {vote.debateStatus.charAt(0).toUpperCase() + vote.debateStatus.slice(1)}
      </Badge>
    );
  };

  const getVotePercentage = () => {
    if (vote.totalVotes === 0) return '0%';
    const percentage = ((vote.side === 'for' ? vote.forVotes : vote.againstVotes) / vote.totalVotes) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/debates/${vote.debateId}`}
              className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
            >
              {vote.debateTitle}
            </Link>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {vote.debateDescription}
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            {getOutcomeBadge()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* User's Vote */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <SideIndicator side={vote.side} />
            <span className="font-medium">Your vote: {vote.side === 'for' ? 'For' : 'Against'}</span>
          </div>
          <span className="text-sm text-muted-foreground">{getVotePercentage()}</span>
        </div>

        {/* Vote Results */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-600">{vote.forVotes}</p>
            <p className="text-xs text-muted-foreground">For</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <p className="text-xl font-bold text-red-600">{vote.againstVotes}</p>
            <p className="text-xs text-muted-foreground">Against</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xl font-bold text-gray-600">{vote.totalVotes}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-4 w-4 mr-2" />
          <span>Voted {formatVoteTimestamp(vote.votedAt)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/debates/${vote.debateId}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Debate
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
