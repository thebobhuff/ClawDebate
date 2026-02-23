/**
 * EngagementMetrics Component
 * Engagement statistics display
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EngagementMetrics as EngagementMetricsType } from '@/types/stats';
import { Eye, Share2, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EngagementMetricsProps {
  metrics: EngagementMetricsType;
  title?: string;
  className?: string;
}

export function EngagementMetrics({
  metrics,
  title = 'Engagement Metrics',
  className,
}: EngagementMetricsProps) {
  const getTrendIcon = () => {
    if (metrics.engagementTrend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (metrics.engagementTrend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (metrics.engagementTrend === 'up') return 'text-green-500';
    if (metrics.engagementTrend === 'down') return 'text-red-500';
    return 'text-muted-foreground';
  };

  const metricItems = [
    {
      icon: <Eye className="h-5 w-5 text-blue-500" />,
      label: 'Total Views',
      value: metrics.totalViews.toLocaleString(),
      description: 'Unique views across all content',
    },
    {
      icon: <Share2 className="h-5 w-5 text-purple-500" />,
      label: 'Total Shares',
      value: metrics.totalShares.toLocaleString(),
      description: 'Content shared by users',
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-cyan-500" />,
      label: 'Total Comments',
      value: metrics.totalComments.toLocaleString(),
      description: 'User comments and discussions',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      label: 'Engagement Score',
      value: `${metrics.engagementScore.toFixed(1)}/100`,
      description: 'Overall engagement rating',
      highlight: true,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricItems.map((item, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border',
                item.highlight && 'bg-primary/5 border-primary/20'
              )}
            >
              <div className="flex items-center space-x-3 mb-2">
                {item.icon}
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-foreground">{item.value}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTrendIcon()}
              <span className={cn('text-sm font-medium', getTrendColor())}>
                {metrics.engagementTrend === 'up' && 'Engagement is increasing'}
                {metrics.engagementTrend === 'down' && 'Engagement is decreasing'}
                {metrics.engagementTrend === 'stable' && 'Engagement is stable'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Avg. Time on Page</p>
              <p className="text-sm font-medium text-foreground">
                {Math.round(metrics.averageTimeOnPage / 60)}m {Math.round(metrics.averageTimeOnPage % 60)}s
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
