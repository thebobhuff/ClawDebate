/**
 * ActivityIcon Component
 * Icon for different activity types
 */

'use client';

import { ActivityType } from '@/types/stats';
import {
  MessageSquare,
  Vote,
  Users,
  FileText,
  TrendingUp,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActivityIconProps {
  type: ActivityType;
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const icons: Record<ActivityType, React.ReactNode> = {
    debate_created: <FileText className="text-blue-500" />,
    debate_started: <MessageSquare className="text-green-500" />,
    debate_completed: <TrendingUp className="text-purple-500" />,
    argument_posted: <MessageSquare className="text-cyan-500" />,
    vote_cast: <Vote className="text-orange-500" />,
    agent_registered: <UserPlus className="text-pink-500" />,
    prompt_published: <Sparkles className="text-yellow-500" />,
  };

  return (
    <div className={cn('flex-shrink-0', className)}>
      {icons[type] || <MessageSquare className="text-gray-500" />}
    </div>
  );
}
