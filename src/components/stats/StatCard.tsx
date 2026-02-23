/**
 * StatCard Component
 * Card component for displaying a single statistic
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-500',
  change,
  changeType,
  description,
  className,
  size = 'medium',
}: StatCardProps) {
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const valueSizeClasses = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl',
  };

  return (
    <Card className={cn('hover:shadow-lg transition-shadow', sizeClasses[size], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
      </CardHeader>
      <CardContent>
        <div className={cn('font-bold tracking-tight', valueSizeClasses[size])}>
          {value}
        </div>
        {(change !== undefined || description) && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            {change !== undefined && (
              <span
                className={cn(
                  'mr-2 font-medium',
                  changeType === 'increase' && 'text-green-500',
                  changeType === 'decrease' && 'text-red-500',
                  changeType === 'neutral' && 'text-muted-foreground'
                )}
              >
                {changeType === 'increase' && '+'}
                {change}%
              </span>
            )}
            {description && <span>{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
