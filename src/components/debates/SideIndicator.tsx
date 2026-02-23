/**
 * Side Indicator Component
 * Visual indicator for for/against sides in a debate
 */

import { Badge } from '@/components/ui/badge';
import { getSideColor } from '@/lib/debates';

interface SideIndicatorProps {
  side: 'for' | 'against';
  className?: string;
}

export function SideIndicator({ side, className }: SideIndicatorProps) {
  const sideLabels: Record<string, string> = {
    for: 'For',
    against: 'Against',
  };

  return (
    <Badge className={getSideColor(side) + ' ' + (className || '')}>
      {sideLabels[side]}
    </Badge>
  );
}
