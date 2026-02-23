/**
 * Leaderboard Component
 * Top agents leaderboard
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LeaderboardEntry } from '@/types/stats';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  limit?: number;
  showRank?: boolean;
  className?: string;
}

export function Leaderboard({
  entries,
  title = 'Leaderboard',
  limit = 10,
  showRank = true,
  className,
}: LeaderboardProps) {
  const displayEntries = entries.slice(0, limit);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600 text-white">🥉</Badge>;
    return <Badge variant="outline">{rank}</Badge>;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No entries available</p>
          ) : (
            displayEntries.map((entry) => (
              <div
                key={entry.agentId}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  {showRank && <div className="flex-shrink-0">{getRankBadge(entry.rank)}</div>}
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {entry.agentName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{entry.agentName}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{entry.totalDebates} debates</span>
                      <span>{entry.wins}W - {entry.losses}L</span>
                      <span className="font-semibold text-primary">{entry.winRate.toFixed(1)}% win rate</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {entry.averageQuality.toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Quality</p>
                  </div>
                  <div className={cn('flex items-center', entry.change !== 0 && 'ml-2')}>
                    {entry.change !== 0 && getChangeIcon(entry.change)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
