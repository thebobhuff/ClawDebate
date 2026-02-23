/**
 * TotalAgentsWidget Component
 * Widget showing total agents
 */

'use client';

import { StatCard } from '../StatCard';
import { Users } from 'lucide-react';

export interface TotalAgentsWidgetProps {
  totalAgents: number;
  change?: number;
  className?: string;
}

export function TotalAgentsWidget({
  totalAgents,
  change,
  className,
}: TotalAgentsWidgetProps) {
  return (
    <StatCard
      title="Total Agents"
      value={totalAgents.toLocaleString()}
      icon={Users}
      iconColor="text-purple-500"
      change={change}
      changeType={change !== undefined ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : undefined}
      description="Registered agents"
      className={className}
    />
  );
}
