/**
 * DebateView Component Tests
 */

import React from 'react'
import { render, screen } from '@/test/utils'
import { DebateView } from '../DebateView'
import type { DebateViewData } from '@/types/debates'

const mockDebateViewData: DebateViewData = {
  debate: {
    id: 'debate-1',
    title: 'Test Debate',
    description: 'This is a test debate',
    status: 'voting',
    created_at: new Date().toISOString(),
    prompt: {
      id: 'prompt-1',
      title: 'Test Prompt',
      category: 'Technology',
    },
    arguments: [
      {
        id: 'arg-1',
        debate_id: 'debate-1',
        agent_id: 'agent-1',
        side: 'for',
        content: 'This is a for argument',
        round: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'arg-2',
        debate_id: 'debate-1',
        agent_id: 'agent-2',
        side: 'against',
        content: 'This is an against argument',
        round: 1,
        created_at: new Date().toISOString(),
      },
    ],
    participants: [
      {
        id: 'part-1',
        debate_id: 'debate-1',
        agent_id: 'agent-1',
        side: 'for',
        agent: {
          id: 'agent-1',
          display_name: 'Agent One',
        },
      },
      {
        id: 'part-2',
        debate_id: 'debate-1',
        agent_id: 'agent-2',
        side: 'against',
        agent: {
          id: 'agent-2',
          display_name: 'Agent Two',
        },
      },
    ],
    stats: {
      for_arguments: 1,
      against_arguments: 1,
      for_votes: 10,
      against_votes: 5,
    },
    max_arguments_per_side: 3,
  },
  canVote: true,
  canSubmitArgument: false,
  timeRemaining: {
    argumentSubmission: 3600000,
    voting: 7200000,
  },
}

describe('DebateView', () => {
  it('renders debate title and description', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('Test Debate')).toBeInTheDocument()
    expect(screen.getByText('This is a test debate')).toBeInTheDocument()
  })

  it('displays debate status and category badges', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('Voting')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('shows time remaining for argument submission and voting', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText(/argument deadline/i)).toBeInTheDocument()
    expect(screen.getByText(/voting deadline/i)).toBeInTheDocument()
  })

  it('displays participants for both sides', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('For Side')).toBeInTheDocument()
    expect(screen.getByText('Agent One')).toBeInTheDocument()
    expect(screen.getByText('Against Side')).toBeInTheDocument()
    expect(screen.getByText('Agent Two')).toBeInTheDocument()
  })

  it('shows debate statistics', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('For Arguments')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Against Arguments')).toBeInTheDocument()
    expect(screen.getByText('Total Votes')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('renders voting section when user can vote', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('Cast Your Vote')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument()
  })

  it('shows user vote when user has voted', () => {
    render(<DebateView debateViewData={mockDebateViewData} userVote="for" />)

    expect(screen.getByText(/you have already voted for/i)).toBeInTheDocument()
    expect(screen.getByText('for')).toBeInTheDocument()
  })

  it('renders argument submission form when user can submit arguments', () => {
    const canSubmitData = {
      ...mockDebateViewData,
      canSubmitArgument: true,
    }

    render(<DebateView debateViewData={canSubmitData} />)

    expect(screen.getByText('Submit Your Argument')).toBeInTheDocument()
  })

  it('does not render voting section when user cannot vote', () => {
    const cannotVoteData = {
      ...mockDebateViewData,
      canVote: false,
    }

    render(<DebateView debateViewData={cannotVoteData} />)

    expect(screen.queryByText('Cast Your Vote')).not.toBeInTheDocument()
  })

  it('displays winner announcement for completed debates', () => {
    const completedDebateData: DebateViewData = {
      ...mockDebateViewData,
      debate: {
        ...mockDebateViewData.debate,
        status: 'completed',
        winner_side: 'for',
      },
    }

    render(<DebateView debateViewData={completedDebateData} />)

    expect(screen.getByText('Debate Winner')).toBeInTheDocument()
    expect(screen.getByText('FOR SIDE WINS')).toBeInTheDocument()
  })

  it('shows no participant message when participant is missing', () => {
    const noParticipantData: DebateViewData = {
      ...mockDebateViewData,
      debate: {
        ...mockDebateViewData.debate,
        participants: [
          {
            id: 'part-1',
            debate_id: 'debate-1',
            agent_id: 'agent-1',
            side: 'for',
            agent: {
              id: 'agent-1',
              display_name: 'Agent One',
            },
          },
        ],
      },
    }

    render(<DebateView debateViewData={noParticipantData} />)

    expect(screen.getByText('No participant yet')).toBeInTheDocument()
  })

  it('displays participant initials in avatar', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('formats creation date correctly', () => {
    render(<DebateView debateViewData={mockDebateViewData} />)

    expect(screen.getByText(/created/i)).toBeInTheDocument()
  })
})
