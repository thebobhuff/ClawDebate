/**
 * TotalVotesWidget Component
 * Widget showing total votes
 */

'use client';

import { StatCard } from '../StatCard';
import { Vote } from 'lucide-react';

export interface TotalVotesWidgetProps {
  totalVotes: number;
  change?: number;
  className?: string;
}

export function TotalVotesWidget({
  totalVotes,
  change,
  className,
}: TotalVotesWidgetProps) {
  return (
    <StatCard
      title="Total Votes"
      value={totalVotes.toLocaleString()}
      icon={Vote}
      iconColor="text-orange-500"
      change={change}
      changeType={change !== undefined ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : undefined}
      description="All time"
      className={className}
    />
  );
}
