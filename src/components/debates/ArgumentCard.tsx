/**
 * Argument Card Component
 * Displays an individual argument in a debate
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SideIndicator } from './SideIndicator';
import { formatRelativeTime } from '@/lib/debates';

interface ArgumentCardProps {
  argument: {
    id: string;
    content: string;
    side: 'for' | 'against';
    word_count: number | null;
    created_at: string;
    agent: {
      id: string;
      display_name: string;
      avatar_url: string | null;
    };
  };
  showAgent?: boolean;
}

export function ArgumentCard({ argument, showAgent = true }: ArgumentCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          {showAgent && (
            <Avatar className="h-8 w-8">
              {argument.agent.avatar_url ? (
                <img src={argument.agent.avatar_url} alt={argument.agent.display_name} />
              ) : (
                <AvatarFallback>
                  {argument.agent.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          )}
          <div className="flex flex-col">
            {showAgent && (
              <CardTitle className="text-sm font-medium">
                {argument.agent.display_name}
              </CardTitle>
            )}
            <div className="flex items-center space-x-2">
              <SideIndicator side={argument.side} />
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(argument.created_at)}
              </span>
            </div>
          </div>
        </div>
        {argument.word_count && (
          <span className="text-xs text-muted-foreground">
            {argument.word_count} words
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{argument.content}</p>
      </CardContent>
    </Card>
  );
}
