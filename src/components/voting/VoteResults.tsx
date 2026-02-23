/**
 * Vote Results Component
 * Display showing vote results with visual bar chart
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Scale } from 'lucide-react';
import type { VoteResults } from '@/types/voting';

interface VoteResultsProps {
  results: VoteResults;
  showWinner?: boolean;
  compact?: boolean;
}

export function VoteResults({ results, showWinner = true, compact = false }: VoteResultsProps) {
  const { forVotes, againstVotes, totalVotes, forPercentage, againstPercentage, winner, margin } = results;

  const getWinnerBadge = () => {
    if (!showWinner || !winner || winner === 'tie') return null;

    if (winner === 'for') {
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <Trophy className="h-3 w-3 mr-1" />
          For Winning
        </Badge>
      );
    }

    return (
      <Badge className="bg-red-600 hover:bg-red-700">
        <Trophy className="h-3 w-3 mr-1" />
        Against Winning
      </Badge>
    );
  };

  const getTieBadge = () => {
    if (!showWinner || winner !== 'tie') return null;

    return (
      <Badge variant="outline" className="border-gray-400">
        <Scale className="h-3 w-3 mr-1" />
        Tie
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Vote Results</span>
          <div className="flex gap-2">
            {getWinnerBadge()}
            {getTieBadge()}
          </div>
        </div>

        <div className="space-y-2">
          {/* For Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-blue-600">For</span>
              <span className="text-muted-foreground">{forVotes} votes ({forPercentage.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${forPercentage}%` }}
              />
            </div>
          </div>

          {/* Against Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-red-600">Against</span>
              <span className="text-muted-foreground">{againstVotes} votes ({againstPercentage.toFixed(1)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{ width: `${againstPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {totalVotes > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Total votes: <span className="font-semibold">{totalVotes}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vote Results</CardTitle>
          <div className="flex gap-2">
            {getWinnerBadge()}
            {getTieBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {totalVotes === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Scale className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No votes yet</p>
            <p className="text-sm">Be the first to vote!</p>
          </div>
        ) : (
          <>
            {/* Vote Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-3xl font-bold text-blue-600">{forVotes}</p>
                <p className="text-sm font-medium text-blue-800">For</p>
                <p className="text-xs text-muted-foreground mt-1">{forPercentage.toFixed(1)}%</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <p className="text-3xl font-bold text-red-600">{againstVotes}</p>
                <p className="text-sm font-medium text-red-800">Against</p>
                <p className="text-xs text-muted-foreground mt-1">{againstPercentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="space-y-3">
              {/* For Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-blue-600">For</span>
                  <span className="text-muted-foreground">{forPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${forPercentage}%` }}
                  />
                </div>
              </div>

              {/* Against Bar */}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-red-600">Against</span>
                  <span className="text-muted-foreground">{againstPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${againstPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Margin */}
            {margin > 0 && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <Scale className="h-4 w-4" />
                <span>
                  Margin: <span className="font-semibold">{margin} vote{margin > 1 ? 's' : ''}</span>
                </span>
              </div>
            )}

            {/* Total */}
            <div className="text-center text-sm text-muted-foreground">
              Total votes: <span className="font-semibold text-lg">{totalVotes}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
