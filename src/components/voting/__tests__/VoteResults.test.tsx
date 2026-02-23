/**
 * VoteResults Component Tests
 */

import React from 'react'
import { render, screen } from '@/test/utils'
import { VoteResults } from '../VoteResults'
import type { VoteResults as VoteResultsType } from '@/types/voting'

const mockVoteResults: VoteResultsType = {
  forVotes: 10,
  againstVotes: 5,
  totalVotes: 15,
  forPercentage: 66.7,
  againstPercentage: 33.3,
  winner: 'for',
  margin: 5,
}

describe('VoteResults', () => {
  it('renders vote results card', () => {
    render(<VoteResults results={mockVoteResults} />)

    expect(screen.getByText('Vote Results')).toBeInTheDocument()
  })

  it('displays for and against vote counts', () => {
    render(<VoteResults results={mockVoteResults} />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays vote percentages', () => {
    render(<VoteResults results={mockVoteResults} />)

    expect(screen.getByText('66.7%')).toBeInTheDocument()
    expect(screen.getByText('33.3%')).toBeInTheDocument()
  })

  it('shows winner badge when showWinner is true', () => {
    render(<VoteResults results={mockVoteResults} showWinner />)

    expect(screen.getByText('For Winning')).toBeInTheDocument()
  })

  it('does not show winner badge when showWinner is false', () => {
    render(<VoteResults results={mockVoteResults} showWinner={false} />)

    expect(screen.queryByText('For Winning')).not.toBeInTheDocument()
  })

  it('shows tie badge when result is tie', () => {
    const tieResults: VoteResultsType = {
      ...mockVoteResults,
      forVotes: 5,
      againstVotes: 5,
      forPercentage: 50,
      againstPercentage: 50,
      winner: 'tie',
      margin: 0,
    }

    render(<VoteResults results={tieResults} />)

    expect(screen.getByText('Tie')).toBeInTheDocument()
  })

  it('shows no votes message when total votes is zero', () => {
    const noVotesResults: VoteResultsType = {
      ...mockVoteResults,
      forVotes: 0,
      againstVotes: 0,
      totalVotes: 0,
      forPercentage: 0,
      againstPercentage: 0,
      winner: null,
      margin: 0,
    }

    render(<VoteResults results={noVotesResults} />)

    expect(screen.getByText('No votes yet')).toBeInTheDocument()
    expect(screen.getByText('Be first to vote!')).toBeInTheDocument()
  })

  it('displays total votes', () => {
    render(<VoteResults results={mockVoteResults} />)

    expect(screen.getByText('Total votes: 15')).toBeInTheDocument()
  })

  it('displays margin when margin is greater than zero', () => {
    render(<VoteResults results={mockVoteResults} />)

    expect(screen.getByText(/margin: 5 votes/i)).toBeInTheDocument()
  })

  it('does not display margin when margin is zero', () => {
    const noMarginResults: VoteResultsType = {
      ...mockVoteResults,
      margin: 0,
    }

    render(<VoteResults results={noMarginResults} />)

    expect(screen.queryByText(/margin:/i)).not.toBeInTheDocument()
  })

  it('renders compact view when compact prop is true', () => {
    const { container } = render(<VoteResults results={mockVoteResults} compact />)

    expect(container.querySelector('.card')).not.toBeInTheDocument()
  })

  it('shows against winning badge when against is winner', () => {
    const againstWinResults: VoteResultsType = {
      ...mockVoteResults,
      forVotes: 5,
      againstVotes: 10,
      forPercentage: 33.3,
      againstPercentage: 66.7,
      winner: 'against',
      margin: 5,
    }

    render(<VoteResults results={againstWinResults} />)

    expect(screen.getByText('Against Winning')).toBeInTheDocument()
  })

  it('renders progress bars with correct widths', () => {
    const { container } = render(<VoteResults results={mockVoteResults} />)

    const forBar = container.querySelector('.bg-blue-600[style*="width: 66.7%"]')
    const againstBar = container.querySelector('.bg-red-600[style*="width: 33.3%"]')

    expect(forBar).toBeInTheDocument()
    expect(againstBar).toBeInTheDocument()
  })
})
