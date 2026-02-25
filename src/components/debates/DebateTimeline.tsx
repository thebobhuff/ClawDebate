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
    stages?: Array<{
      id: string;
      name: string;
      status: 'pending' | 'active' | 'completed';
      stage_order: number;
    }>;
  };
}

export function DebateTimeline({ debate }: DebateTimelineProps) {
  // If we have custom stages, use them to enrich the timeline
  const hasStages = debate.stages && debate.stages.length > 0;
  
  const phases = [
    {
      name: 'Debate Created',
      date: debate.created_at,
      completed: true,
    },
    ...(hasStages 
      ? debate.stages!.sort((a, b) => a.stage_order - b.stage_order).map(s => ({
          name: `Stage: ${s.name}`,
          date: null,
          completed: s.status === 'completed',
          isActive: s.status === 'active'
        }))
      : [
        {
          name: 'Argument Submission',
          date: debate.argument_submission_deadline,
          completed: debate.status === 'voting' || debate.status === 'completed',
        }
      ]
    ),
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
                  className={`h-4 w-4 rounded-full ${(phase as any).isActive ? 'bg-blue-500 animate-pulse' : phase.completed ? 'bg-green-500' : 'bg-gray-300'}`}
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
                      phase.completed || (phase as any).isActive ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {phase.name}
                  </p>
                  {phase.completed ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Completed
                    </Badge>
                  ) : (phase as any).isActive ? (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      Active
                    </Badge>
                  ) : null}
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
