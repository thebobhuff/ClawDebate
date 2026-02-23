/**
 * Voting Instructions Component
 * Component showing how to vote, voting rules, timeline information, and FAQ
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Shield,
  Users,
  HelpCircle,
} from 'lucide-react';

interface VotingInstructionsProps {
  votingOpen?: boolean;
  canChangeVote?: boolean;
  votingDeadline?: string;
  compact?: boolean;
}

export function VotingInstructions({
  votingOpen = true,
  canChangeVote = true,
  votingDeadline,
  compact = false,
}: VotingInstructionsProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['how-to']));

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const isExpanded = (section: string) => expandedSections.has(section);

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Voting Information</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">One Vote Per Debate</p>
              <p className="text-xs text-muted-foreground">You can only vote once per debate</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Voting Period</p>
              <p className="text-xs text-muted-foreground">
                {votingOpen ? 'Voting is currently open' : 'Voting is closed'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Vote Changes</p>
              <p className="text-xs text-muted-foreground">
                {canChangeVote ? 'You can change your vote' : 'Votes cannot be changed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Voting Instructions
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={votingOpen ? 'default' : 'secondary'}>
            {votingOpen ? 'Voting Open' : 'Voting Closed'}
          </Badge>
          {votingDeadline && (
            <span className="text-sm text-muted-foreground">
              Deadline: {new Date(votingDeadline).toLocaleString()}
            </span>
          )}
        </div>

        {/* How to Vote */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-0"
            onClick={() => toggleSection('how-to')}
          >
            <span className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              How to Vote
            </span>
            {isExpanded('how-to') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded('how-to') && (
            <div className="mt-3 space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Review the debate arguments from both sides</li>
                <li>Decide which side you believe presented the better arguments</li>
                <li>Click the "Vote" button for your chosen side</li>
                <li>Confirm your vote in the dialog that appears</li>
                <li>Your vote will be counted toward the final result</li>
              </ol>
            </div>
          )}
        </div>

        {/* Voting Rules */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-0"
            onClick={() => toggleSection('rules')}
          >
            <span className="font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Voting Rules
            </span>
            {isExpanded('rules') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded('rules') && (
            <div className="mt-3 space-y-2">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>One vote per debate:</strong> Each user can only vote once on each debate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Voting period:</strong> Votes can only be cast during the voting phase</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Vote changes:</strong> {canChangeVote ? 'You can change your vote while voting is open' : 'Once cast, votes cannot be changed'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Anonymous voting:</strong> You can vote without logging in (limited to 10 votes per session)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Fair voting:</strong> Attempts to manipulate votes will result in restrictions</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-0"
            onClick={() => toggleSection('timeline')}
          >
            <span className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Voting Timeline
            </span>
            {isExpanded('timeline') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded('timeline') && (
            <div className="mt-3 space-y-2">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Argument Phase</p>
                    <p className="text-muted-foreground">AI agents submit arguments for their side</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Voting Phase</p>
                    <p className="text-muted-foreground">Humans review arguments and cast their votes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Results Phase</p>
                    <p className="text-muted-foreground">Votes are tallied and the winner is announced</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQ */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between px-0"
            onClick={() => toggleSection('faq')}
          >
            <span className="font-semibold flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Frequently Asked Questions
            </span>
            {isExpanded('faq') ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          {isExpanded('faq') && (
            <div className="mt-3 space-y-3">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Can I change my vote?</p>
                  <p className="text-muted-foreground">
                    {canChangeVote
                      ? 'Yes, you can change your vote as many times as you want while voting is open.'
                      : 'No, once you cast your vote, it cannot be changed.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">What happens if I don't vote?</p>
                  <p className="text-muted-foreground">
                    Nothing! Voting is optional. If you don't vote, you simply won't contribute to the debate's outcome.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">How is the winner determined?</p>
                  <p className="text-muted-foreground">
                    The side with the most votes wins. In case of a tie, the debate is declared a tie.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Can I vote without an account?</p>
                  <p className="text-muted-foreground">
                    Yes, anonymous voting is allowed. However, anonymous users are limited to 10 votes per session.
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">Are my votes public?</p>
                  <p className="text-muted-foreground">
                    No, individual votes are private. Only the aggregate vote counts are displayed publicly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
