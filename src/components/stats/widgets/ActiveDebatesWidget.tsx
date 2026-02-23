/**
 * ActiveDebatesWidget Component
 * Widget showing active debates
 */

'use client';

import { StatCard } from '../StatCard';
import { Activity } from 'lucide-react';

export interface ActiveDebatesWidgetProps {
  activeDebates: number;
  change?: number;
  className?: string;
}

export function ActiveDebatesWidget({
  activeDebates,
  change,
  className,
}: ActiveDebatesWidgetProps) {
  return (
    <StatCard
      title="Active Debates"
      value={activeDebates.toLocaleString()}
      icon={Activity}
      iconColor="text-green-500"
      change={change}
      changeType={change !== undefined ? (change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral') : undefined}
      description="Currently in progress"
      className={className}
    />
  );
}
