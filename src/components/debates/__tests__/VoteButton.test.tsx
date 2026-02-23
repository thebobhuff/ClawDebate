/**
 * VoteButton Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { VoteButton } from '../VoteButton'

describe('VoteButton', () => {
  const defaultProps = {
    debateId: 'debate-1',
    side: 'for' as const,
  }

  it('renders vote button', () => {
    render(<VoteButton {...defaultProps} />)

    expect(screen.getByRole('button', { name: /vote/i })).toBeInTheDocument()
  })

  it('shows correct button text for initial state', () => {
    render(<VoteButton {...defaultProps} />)

    expect(screen.getByText('Vote')).toBeInTheDocument()
  })

  it('shows voted state when user has voted for this side', () => {
    render(<VoteButton {...defaultProps} userVote="for" />)

    expect(screen.getByText('Voted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voted/i })).toBeDisabled()
  })

  it('shows change vote text when user has voted for other side', () => {
    render(<VoteButton {...defaultProps} userVote="against" />)

    expect(screen.getByText('Change to this side')).toBeInTheDocument()
  })

  it('disables button when disabled prop is true', () => {
    render(<VoteButton {...defaultProps} disabled />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows voting is closed message when voting is closed', () => {
    render(<VoteButton {...defaultProps} votingOpen={false} />)

    expect(screen.getByText('Voting is closed')).toBeInTheDocument()
  })

  it('shows loading state when voting', () => {
    render(<VoteButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Voting...')).toBeInTheDocument()
  })

  it('shows confirmation dialog on vote click', async () => {
    render(<VoteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /vote/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Vote')).toBeInTheDocument()
    })
  })

  it('shows confirmation dialog with vote change message', async () => {
    render(<VoteButton {...defaultProps} userVote="against" />)

    const button = screen.getByRole('button', { name: /change to this side/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/this will change your vote from against to for/i)).toBeInTheDocument()
    })
  })

  it('closes confirmation dialog on cancel', async () => {
    render(<VoteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /vote/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Vote')).toBeInTheDocument()
    })

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Confirm Your Vote')).not.toBeInTheDocument()
    })
  })

  it('calls onVoteSuccess on confirm vote', async () => {
    const onVoteSuccess = jest.fn()
    render(<VoteButton {...defaultProps} onVoteSuccess={onVoteSuccess} />)

    const button = screen.getByRole('button', { name: /vote/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Vote')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /confirm vote/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(onVoteSuccess).toHaveBeenCalled()
    })
  })

  it('calls onVoteChange on confirm vote change', async () => {
    const onVoteChange = jest.fn()
    render(<VoteButton {...defaultProps} userVote="against" onVoteChange={onVoteChange} />)

    const button = screen.getByRole('button', { name: /change to this side/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Confirm Your Vote')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /confirm vote/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(onVoteChange).toHaveBeenCalled()
    })
  })

  it('does not show confirmation dialog when button is disabled', () => {
    render(<VoteButton {...defaultProps} disabled />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.queryByText('Confirm Your Vote')).not.toBeInTheDocument()
  })

  it('does not show confirmation dialog when voting is closed', () => {
    render(<VoteButton {...defaultProps} votingOpen={false} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.queryByText('Confirm Your Vote')).not.toBeInTheDocument()
  })

  it('shows check icon when user has voted', () => {
    render(<VoteButton {...defaultProps} userVote="for" />)

    const button = screen.getByRole('button')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('shows side indicator in button', () => {
    render(<VoteButton {...defaultProps} />)

    expect(screen.getByText('FOR')).toBeInTheDocument()
  })

  it('shows badge with current vote when user has voted for other side', () => {
    render(<VoteButton {...defaultProps} userVote="against" />)

    expect(screen.getByText('You voted against')).toBeInTheDocument()
  })

  it('disables button when loading', async () => {
    render(<VoteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: /vote/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled()
    })
  })
})
