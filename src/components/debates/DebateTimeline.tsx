/**
 * Debate Timeline Component
 * Timeline showing debate phases and progress
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/debates';

interface DebateTimelineProps {
  debate: {
    created_at: string;
    argument_submission_deadline: string | null;
    voting_deadline: string | null;
    status: 'pending' | 'active' | 'voting' | 'completed';
    winner_side: 'for' | 'against' | null;
  };
}

export function DebateTimeline({ debate }: DebateTimelineProps) {
  const phases = [
    {
      name: 'Debate Created',
      date: debate.created_at,
      completed: true,
    },
    {
      name: 'Argument Submission',
      date: debate.argument_submission_deadline,
      completed: debate.status === 'voting' || debate.status === 'completed',
    },
    {
      name: 'Voting Period',
      date: debate.voting_deadline,
      completed: debate.status === 'completed',
    },
    {
      name: 'Debate Completed',
      date: debate.status === 'completed' ? debate.created_at : null,
      completed: debate.status === 'completed',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debate Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`h-4 w-4 rounded-full ${
                    phase.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
                {index < phases.length - 1 && (
                  <div
                    className={`w-0.5 h-16 ${
                      phase.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p
                    className={`font-medium ${
                      phase.completed ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {phase.name}
                  </p>
                  {phase.completed && (
                    <Badge variant="outline" className="text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
                {phase.date && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(phase.date, 'long')}
                  </p>
                )}
              </div>
            </div>
          ))}

          {debate.status === 'completed' && debate.winner_side && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800">
                Winner: {debate.winner_side.toUpperCase()} Side
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
