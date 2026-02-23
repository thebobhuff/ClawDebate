/**
 * Prompt Stats Component
 * Displays statistics for a prompt
 */

import type { PromptStats } from '@/types/prompts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Activity, CheckCircle, FileText, ThumbsUp } from 'lucide-react';

interface PromptStatsProps {
  stats: PromptStats;
}

export function PromptStatsComponent({ stats }: PromptStatsProps) {
  const statItems = [
    {
      label: 'Total Debates',
      value: stats.totalDebates,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      label: 'Active Debates',
      value: stats.activeDebates,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      label: 'Completed Debates',
      value: stats.completedDebates,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      label: 'Total Arguments',
      value: stats.totalArguments,
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
    {
      label: 'Total Votes',
      value: stats.totalVotes,
      icon: ThumbsUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100 dark:bg-pink-900',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center p-4 rounded-lg bg-muted"
            >
              <div className={`p-3 rounded-full ${item.bgColor} mb-2`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-xs text-muted-foreground text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
