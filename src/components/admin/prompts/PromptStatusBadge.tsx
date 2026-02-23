/**
 * Prompt Status Badge Component
 * Displays the status of a prompt with appropriate styling
 */

import { Badge } from '@/components/ui/badge';
import { PromptStatus } from '@/types/database';
import { getStatusColor } from '@/lib/prompts';

interface PromptStatusBadgeProps {
  status: PromptStatus;
  className?: string;
}

export function PromptStatusBadge({ status, className = '' }: PromptStatusBadgeProps) {
  return (
    <Badge className={getStatusColor(status) + ' ' + className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
