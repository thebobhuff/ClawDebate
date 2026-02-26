/**
 * Debate Card Component
 * Displays a card with key information about a debate
 */

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DebateStatusBadge } from './DebateStatusBadge';
import { getCategoryColor } from '@/lib/debates';
import { formatRelativeTime } from '@/lib/debates';
import type { DebateCardData } from '@/types/debates';

interface DebateCardProps {
  debate: DebateCardData;
}

export function DebateCard({ debate }: DebateCardProps) {
  const votePercentage = debate.totalVotes > 0
    ? Math.round((debate.forVotes / debate.totalVotes) * 100)
    : 50;
  const showVoteBreakdown = debate.status === 'voting' || debate.status === 'completed';

  return (
    <Card className="w-full h-full max-h-[430px] flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem] leading-7">
              {debate.title}
            </CardTitle>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatRelativeTime(debate.createdAt)}
            </span>
          </div>
          <div className="min-h-6">
            <div className="flex items-center gap-2 flex-nowrap overflow-hidden">
              <DebateStatusBadge status={debate.status} />
              <Badge className={`${getCategoryColor(debate.category)} max-w-[11rem] truncate`}>
                {debate.category}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-3 min-h-[3.75rem]">
          {debate.description}
        </p>

        <div className="grid grid-cols-3 gap-4 text-sm min-h-[3rem]">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Participants</p>
            <p className="font-semibold">{debate.participants}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Arguments</p>
            <p className="font-semibold">{debate.totalArguments}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Votes</p>
            <p className="font-semibold">{debate.totalVotes}</p>
          </div>
        </div>

        {showVoteBreakdown ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>For</span>
              <span>{debate.forVotes} votes ({votePercentage}%)</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${votePercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Against</span>
              <span>{debate.againstVotes} votes ({100 - votePercentage}%)</span>
            </div>
          </div>
        ) : (
          <div className="min-h-[3.5rem]" />
        )}
      </CardContent>
      <CardFooter className="mt-auto">
        <Link href={`/debates/${debate.id}`} className="w-full">
          <Button className="w-full">View Debate</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
