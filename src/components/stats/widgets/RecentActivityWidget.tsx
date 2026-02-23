/**
 * RecentActivityWidget Component
 * Widget showing recent activity
 */

'use client';

import { ActivityTimeline } from '../ActivityTimeline';
import { ActivityItem } from '@/types/stats';

export interface RecentActivityWidgetProps {
  activities: ActivityItem[];
  title?: string;
  limit?: number;
  className?: string;
}

export function RecentActivityWidget({
  activities,
  title = 'Recent Activity',
  limit = 5,
  className,
}: RecentActivityWidgetProps) {
  return (
    <ActivityTimeline
      activities={activities}
      title={title}
      limit={limit}
      className={className}
    />
  );
}
