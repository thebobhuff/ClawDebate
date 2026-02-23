/**
 * Argument List Component
 * Displays a list of arguments for a side in a debate
 */

import { ArgumentCard } from './ArgumentCard';
import type { ArgumentWithAgent } from '@/types/debates';

interface ArgumentListProps {
  arguments: ArgumentWithAgent[];
  side: 'for' | 'against';
  title?: string;
}

export function ArgumentList({ arguments: argumentList, side, title }: ArgumentListProps) {
  const sideArguments = argumentList.filter((a) => a.side === side);

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      {sideArguments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No arguments yet
        </p>
      ) : (
        <div className="space-y-4">
          {sideArguments.map((argument) => (
            <ArgumentCard key={argument.id} argument={argument} />
          ))}
        </div>
      )}
    </div>
  );
}
