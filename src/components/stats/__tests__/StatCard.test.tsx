/**
 * StatCard Component Tests
 */

import React from 'react'
import { render, screen } from '@/test/utils'
import { StatCard } from '../StatCard'
import { TrendingUp } from 'lucide-react'

describe('StatCard', () => {
  it('renders stat card with title and value', () => {
    render(<StatCard title="Total Votes" value="1,234" />)

    expect(screen.getByText('Total Votes')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<StatCard title="Total Votes" value="1,234" icon={TrendingUp} />)

    const icon = screen.getByRole('img')
    expect(icon).toBeInTheDocument()
  })

  it('applies icon color class', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" icon={TrendingUp} iconColor="text-green-500" />
    )

    const icon = container.querySelector('.text-green-500')
    expect(icon).toBeInTheDocument()
  })

  it('displays change percentage with increase type', () => {
    render(<StatCard title="Total Votes" value="1,234" change={12.5} changeType="increase" />)

    expect(screen.getByText('+12.5%')).toBeInTheDocument()
  })

  it('displays change percentage with decrease type', () => {
    render(<StatCard title="Total Votes" value="1,234" change={8.3} changeType="decrease" />)

    expect(screen.getByText('8.3%')).toBeInTheDocument()
  })

  it('displays change percentage with neutral type', () => {
    render(<StatCard title="Total Votes" value="1,234" change={0} changeType="neutral" />)

    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('applies correct color for increase type', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" change={12.5} changeType="increase" />
    )

    const changeText = container.querySelector('.text-green-500')
    expect(changeText).toBeInTheDocument()
  })

  it('applies correct color for decrease type', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" change={8.3} changeType="decrease" />
    )

    const changeText = container.querySelector('.text-red-500')
    expect(changeText).toBeInTheDocument()
  })

  it('displays description when provided', () => {
    render(<StatCard title="Total Votes" value="1,234" description="Last 30 days" />)

    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })

  it('applies small size classes', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" size="small" />
    )

    const card = container.querySelector('.p-4')
    const value = container.querySelector('.text-2xl')
    expect(card).toBeInTheDocument()
    expect(value).toBeInTheDocument()
  })

  it('applies medium size classes by default', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" />
    )

    const card = container.querySelector('.p-6')
    const value = container.querySelector('.text-3xl')
    expect(card).toBeInTheDocument()
    expect(value).toBeInTheDocument()
  })

  it('applies large size classes', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" size="large" />
    )

    const card = container.querySelector('.p-8')
    const value = container.querySelector('.text-4xl')
    expect(card).toBeInTheDocument()
    expect(value).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard title="Total Votes" value="1,234" className="custom-class" />
    )

    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('renders numeric value', () => {
    render(<StatCard title="Total Votes" value={1234} />)

    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('does not display change when not provided', () => {
    render(<StatCard title="Total Votes" value="1,234" />)

    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })

  it('displays both change and description', () => {
    render(
      <StatCard
        title="Total Votes"
        value="1,234"
        change={12.5}
        changeType="increase"
        description="Last 30 days"
      />
    )

    expect(screen.getByText('+12.5%')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })
})
