/**
 * DebateCard Component Tests
 */

import React from 'react'
import { render, screen } from '@/test/utils'
import { DebateCard } from '../DebateCard'
import type { DebateCardData } from '@/types/debates'

const mockDebate: DebateCardData = {
  id: 'debate-1',
  title: 'Test Debate',
  description: 'This is a test debate description',
  category: 'Technology',
  status: 'active',
  createdAt: new Date().toISOString(),
  participants: 2,
  totalArguments: 4,
  totalVotes: 10,
  forVotes: 6,
  againstVotes: 4,
}

describe('DebateCard', () => {
  it('renders debate information correctly', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByText('Test Debate')).toBeInTheDocument()
    expect(screen.getByText('This is a test debate description')).toBeInTheDocument()
    expect(screen.getByText('Technology')).toBeInTheDocument()
  })

  it('displays debate statistics', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByText('Participants')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Arguments')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Votes')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('shows vote progress bar for voting and completed debates', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByText('For')).toBeInTheDocument()
    expect(screen.getByText('6 votes (60%)')).toBeInTheDocument()
    expect(screen.getByText('Against')).toBeInTheDocument()
    expect(screen.getByText('4 votes (40%)')).toBeInTheDocument()
  })

  it('calculates vote percentage correctly', () => {
    const debateWithNoVotes: DebateCardData = {
      ...mockDebate,
      totalVotes: 0,
      forVotes: 0,
      againstVotes: 0,
    }

    render(<DebateCard debate={debateWithNoVotes} />)

    expect(screen.getByText('0 votes (50%)')).toBeInTheDocument()
  })

  it('does not show vote progress for active debates', () => {
    const activeDebate: DebateCardData = {
      ...mockDebate,
      status: 'active',
    }

    render(<DebateCard debate={activeDebate} />)

    expect(screen.queryByText('For')).not.toBeInTheDocument()
    expect(screen.queryByText('Against')).not.toBeInTheDocument()
  })

  it('renders view debate button', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByRole('button', { name: /view debate/i })).toBeInTheDocument()
  })

  it('links to debate detail page', () => {
    render(<DebateCard debate={mockDebate} />)

    const link = screen.getByRole('button', { name: /view debate/i }).closest('a')
    expect(link).toHaveAttribute('href', '/debates/debate-1')
  })

  it('truncates long descriptions', () => {
    const longDescriptionDebate: DebateCardData = {
      ...mockDebate,
      description: 'This is a very long description that should be truncated to fit within the card layout. It has more than three lines of text.',
    }

    render(<DebateCard debate={longDescriptionDebate} />)

    const description = screen.getByText(/this is a very long description/i)
    expect(description).toHaveClass('line-clamp-3')
  })

  it('displays relative time', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByText(/\d+ (second|minute|hour|day)s? ago/i)).toBeInTheDocument()
  })

  it('shows status badge', () => {
    render(<DebateCard debate={mockDebate} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})
