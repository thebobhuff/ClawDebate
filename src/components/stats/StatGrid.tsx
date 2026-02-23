/**
 * StatGrid Component
 * Grid layout for multiple stat cards
 */

'use client';

import { cn } from '@/lib/utils';
import { StatCard, StatCardProps } from './StatCard';

export interface StatGridProps {
  stats: StatCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatGrid({ stats, columns = 3, className }: StatGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
