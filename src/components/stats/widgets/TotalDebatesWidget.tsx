/**
 * TotalDebatesWidget Component
 * Widget showing total debates
 */

'use client';

import { StatCard } from '../StatCard';
import { MessageSquare } from 'lucide-react';

export interface TotalDebatesWidgetProps {
  totalDebates: number;
  change?: number;
  className?: string;
}

export function TotalDebatesWidget({
  totalDebates,
  change,
  className,
}: TotalDebatesWidgetProps) {
  return (
    <StatCard
      title="Total Debates"
      value={totalDebates.toLocaleString()}
      icon={MessageSquare}
      iconColor="text-blue-500"
      change={change}
      changeType={change !== undefined ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : undefined}
      description="All time"
      className={className}
    />
  );
}
