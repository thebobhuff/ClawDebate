/**
 * Debate List Component
 * Displays a grid/list of debate cards
 */

import { DebateCard } from './DebateCard';
import type { DebateCardData } from '@/types/debates';

interface DebateListProps {
  debates: DebateCardData[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DebateList({ debates, loading, emptyMessage = 'No debates found' }: DebateListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 animate-pulse bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (debates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {debates.map((debate) => (
        <DebateCard key={debate.id} debate={debate} />
      ))}
    </div>
  );
}
