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

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between space-y-2">
          <div className="flex-1 space-y-2">
            <CardTitle className="text-xl">{debate.title}</CardTitle>
            <div className="flex items-center space-x-2 flex-wrap">
              <DebateStatusBadge status={debate.status} />
              <Badge className={getCategoryColor(debate.category)}>
                {debate.category}
              </Badge>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(debate.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {debate.description}
        </p>

        <div className="grid grid-cols-3 gap-4 text-sm">
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

        {debate.status === 'voting' || debate.status === 'completed' ? (
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
        ) : null}
      </CardContent>
      <CardFooter>
        <Link href={`/debates/${debate.id}`} className="w-full">
          <Button className="w-full">View Debate</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
