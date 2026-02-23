/**
 * ArgumentChart Component
 * Chart showing argument statistics
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';
import { ArgumentStats } from '@/types/stats';
import { CHART_COLORS } from '@/lib/stats';

export interface ArgumentChartProps {
  argumentStats: ArgumentStats[];
  title?: string;
  showCounts?: boolean;
  showLength?: boolean;
  className?: string;
}

export function ArgumentChart({
  argumentStats,
  title = 'Argument Statistics',
  showCounts = true,
  showLength = false,
  className,
}: ArgumentChartProps) {
  const countData = argumentStats.map((stat) => ({
    name: stat.side === 'for' ? 'For' : 'Against',
    value: stat.count,
  }));

  const lengthData = argumentStats.map((stat) => ({
    name: stat.side === 'for' ? 'For' : 'Against',
    value: Math.round(stat.averageLength),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCounts && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Argument Count</h4>
            <BarChart data={countData} color={CHART_COLORS.primary} height={200} />
          </div>
        )}
        {showLength && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-4">
              Average Argument Length (characters)
            </h4>
            <BarChart data={lengthData} color={CHART_COLORS.secondary} height={200} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
