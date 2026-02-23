/**
 * CategoryBreakdown Component
 * Visual breakdown by category
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';
import { CategoryStats } from '@/types/stats';

export interface CategoryBreakdownProps {
  categories: CategoryStats[];
  title?: string;
  sortBy?: 'debates' | 'votes' | 'arguments' | 'duration';
  limit?: number;
  className?: string;
}

export function CategoryBreakdown({
  categories,
  title = 'Category Breakdown',
  sortBy = 'debates',
  limit = 10,
  className,
}: CategoryBreakdownProps) {
  const sortedCategories = [...categories]
    .sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy])
    .slice(0, limit);

  const data = sortedCategories.map((cat) => ({
    name: cat.category,
    value: (cat as any)[sortBy],
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart
          data={data}
          height={400}
          layout="horizontal"
          showGrid={false}
        />
      </CardContent>
    </Card>
  );
}
