/**
 * Leaderboard Component Tests
 */

import React from 'react'
import { render, screen } from '@/test/utils'
import { Leaderboard } from '../Leaderboard'
import type { LeaderboardEntry } from '@/types/stats'

const mockEntries: LeaderboardEntry[] = [
  {
    agentId: 'agent-1',
    agentName: 'Agent One',
    rank: 1,
    totalDebates: 10,
    wins: 8,
    losses: 2,
    winRate: 80,
    averageQuality: 9.2,
    change: 2,
  },
  {
    agentId: 'agent-2',
    agentName: 'Agent Two',
    rank: 2,
    totalDebates: 8,
    wins: 5,
    losses: 3,
    winRate: 62.5,
    averageQuality: 8.5,
    change: -1,
  },
  {
    agentId: 'agent-3',
    agentName: 'Agent Three',
    rank: 3,
    totalDebates: 6,
    wins: 3,
    losses: 3,
    winRate: 50,
    averageQuality: 7.8,
    change: 0,
  },
]

describe('Leaderboard', () => {
  it('renders leaderboard with title', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(<Leaderboard entries={mockEntries} title="Top Agents" />)

    expect(screen.getByText('Top Agents')).toBeInTheDocument()
  })

  it('renders all entries', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('Agent One')).toBeInTheDocument()
    expect(screen.getByText('Agent Two')).toBeInTheDocument()
    expect(screen.getByText('Agent Three')).toBeInTheDocument()
  })

  it('respects limit prop', () => {
    render(<Leaderboard entries={mockEntries} limit={2} />)

    expect(screen.getByText('Agent One')).toBeInTheDocument()
    expect(screen.getByText('Agent Two')).toBeInTheDocument()
    expect(screen.queryByText('Agent Three')).not.toBeInTheDocument()
  })

  it('displays rank badges for top 3', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('🥈')).toBeInTheDocument()
    expect(screen.getByText('🥉')).toBeInTheDocument()
  })

  it('displays numeric rank for positions beyond 3', () => {
    const entriesWithMore = [
      ...mockEntries,
      {
        agentId: 'agent-4',
        agentName: 'Agent Four',
        rank: 4,
        totalDebates: 5,
        wins: 2,
        losses: 3,
        winRate: 40,
        averageQuality: 7.0,
        change: 0,
      },
    ]

    render(<Leaderboard entries={entriesWithMore} />)

    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('hides rank when showRank is false', () => {
    render(<Leaderboard entries={mockEntries} showRank={false} />)

    expect(screen.queryByText('🥇')).not.toBeInTheDocument()
    expect(screen.queryByText('🥈')).not.toBeInTheDocument()
    expect(screen.queryByText('🥉')).not.toBeInTheDocument()
  })

  it('displays agent statistics', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('10 debates')).toBeInTheDocument()
    expect(screen.getByText('8W - 2L')).toBeInTheDocument()
    expect(screen.getByText('80.0% win rate')).toBeInTheDocument()
  })

  it('displays average quality score', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
  })

  it('displays trending up icon for positive change', () => {
    render(<Leaderboard entries={mockEntries} />)

    const trendingUpIcon = screen.getByRole('img', { name: /trending up/i })
    expect(trendingUpIcon).toBeInTheDocument()
  })

  it('displays trending down icon for negative change', () => {
    render(<Leaderboard entries={mockEntries} />)

    const trendingDownIcon = screen.getByRole('img', { name: /trending down/i })
    expect(trendingDownIcon).toBeInTheDocument()
  })

  it('does not display change icon for zero change', () => {
    render(<Leaderboard entries={mockEntries} />)

    const minusIcon = screen.getByRole('img', { name: /minus/i })
    expect(minusIcon).toBeInTheDocument()
  })

  it('displays agent avatar with initial', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows no entries message when entries array is empty', () => {
    render(<Leaderboard entries={[]} />)

    expect(screen.getByText('No entries available')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <Leaderboard entries={mockEntries} className="custom-class" />
    )

    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('formats win rate to one decimal place', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('62.5% win rate')).toBeInTheDocument()
  })

  it('formats average quality to zero decimal places', () => {
    render(<Leaderboard entries={mockEntries} />)

    expect(screen.getByText('9')).toBeInTheDocument()
  })
})
