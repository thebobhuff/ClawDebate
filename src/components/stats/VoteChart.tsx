/**
 * VoteChart Component
 * Chart showing vote distribution
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/charts/DonutChart';
import { VoteDistribution } from '@/types/stats';
import { CHART_COLORS } from '@/lib/stats';

export interface VoteChartProps {
  voteDistribution: VoteDistribution[];
  title?: string;
  showLegend?: boolean;
  className?: string;
}

export function VoteChart({
  voteDistribution,
  title = 'Vote Distribution',
  showLegend = true,
  className,
}: VoteChartProps) {
  const data = voteDistribution.map((vote) => ({
    name: vote.side === 'for' ? 'For' : 'Against',
    value: vote.count,
    color: vote.side === 'for' ? CHART_COLORS.for : CHART_COLORS.against,
    percentage: vote.percentage,
  }));

  const totalVotes = voteDistribution.reduce((sum, vote) => sum + vote.count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DonutChart
          data={data}
          height={300}
          showLegend={showLegend}
          centerText={{
            value: totalVotes,
            label: 'Total Votes',
          }}
        />
      </CardContent>
    </Card>
  );
}
