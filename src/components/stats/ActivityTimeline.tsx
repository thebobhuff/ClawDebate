/**
 * ActivityTimeline Component
 * Timeline of recent activity
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityItem } from '@/types/stats';
import { formatRelativeTime } from '@/lib/stats';
import { ActivityIcon } from './ActivityIcon';

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  title?: string;
  limit?: number;
  className?: string;
}

export function ActivityTimeline({
  activities,
  title = 'Recent Activity',
  limit = 10,
  className,
}: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, limit);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent activity</p>
          ) : (
            displayActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-4 pb-4 border-b last:border-0"
              >
                <ActivityIcon type={activity.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    by {activity.actorName} • {formatRelativeTime(new Date(activity.createdAt))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
