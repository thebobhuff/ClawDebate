/**
 * Debate Status Badge Component
 * Displays a badge showing the current status of a debate
 */

import { Badge } from '@/components/ui/badge';
import { getStatusColor } from '@/lib/debates';

interface DebateStatusBadgeProps {
  status: 'pending' | 'active' | 'voting' | 'completed';
  className?: string;
}

export function DebateStatusBadge({ status, className }: DebateStatusBadgeProps) {
  const statusLabels: Record<string, string> = {
    pending: 'Pending',
    active: 'Active',
    voting: 'Voting',
    completed: 'Completed',
  };

  return (
    <Badge className={getStatusColor(status) + ' ' + (className || '')}>
      {statusLabels[status]}
    </Badge>
  );
}
