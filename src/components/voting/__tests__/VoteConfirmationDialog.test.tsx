/**
 * VoteConfirmationDialog Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { VoteConfirmationDialog } from '../VoteConfirmationDialog'
import type { VoteConfirmationData } from '@/types/voting'

const mockVoteData: VoteConfirmationData = {
  debateTitle: 'Test Debate',
  debateDescription: 'This is a test debate description',
  selectedSide: 'for',
  forVotes: 10,
  againstVotes: 5,
  totalVotes: 15,
  isFinal: false,
  canChange: true,
}

describe('VoteConfirmationDialog', () => {
  it('renders dialog when open is true', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText('Confirm Your Vote')).toBeInTheDocument()
    expect(screen.getByText('Please review your vote before confirming')).toBeInTheDocument()
  })

  it('does not render dialog when open is false', () => {
    render(
      <VoteConfirmationDialog
        open={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.queryByText('Confirm Your Vote')).not.toBeInTheDocument()
  })

  it('displays debate title and description', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText('Test Debate')).toBeInTheDocument()
    expect(screen.getByText('This is a test debate description')).toBeInTheDocument()
  })

  it('displays selected side information', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText("You're voting For")).toBeInTheDocument()
    expect(screen.getByText('Supporting affirmative position')).toBeInTheDocument()
  })

  it('displays current vote counts', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Total votes: 15')).toBeInTheDocument()
  })

  it('shows vote is final warning when isFinal is true', () => {
    const finalVoteData: VoteConfirmationData = {
      ...mockVoteData,
      isFinal: true,
    }

    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={finalVoteData}
      />
    )

    expect(screen.getByText('Vote is Final')).toBeInTheDocument()
    expect(screen.getByText('Once you submit your vote, it cannot be changed.')).toBeInTheDocument()
  })

  it('shows vote can be changed message when canChange is true', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText('Vote Can Be Changed')).toBeInTheDocument()
    expect(screen.getByText('You can change your vote while voting is still open.')).toBeInTheDocument()
  })

  it('does not show vote can be changed message when canChange is false', () => {
    const cannotChangeData: VoteConfirmationData = {
      ...mockVoteData,
      canChange: false,
    }

    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={cannotChangeData}
      />
    )

    expect(screen.queryByText('Vote Can Be Changed')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn()

    render(
      <VoteConfirmationDialog
        open
        onClose={onClose}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = jest.fn()

    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={onConfirm}
        data={mockVoteData}
      />
    )

    const confirmButton = screen.getByRole('button', { name: /confirm vote/i })
    fireEvent.click(confirmButton)

    expect(onConfirm).toHaveBeenCalled()
  })

  it('displays correct side label for against side', () => {
    const againstVoteData: VoteConfirmationData = {
      ...mockVoteData,
      selectedSide: 'against',
    }

    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={againstVoteData}
      />
    )

    expect(screen.getByText("You're voting Against")).toBeInTheDocument()
    expect(screen.getByText('Supporting negative position')).toBeInTheDocument()
  })

  it('shows for side with blue color scheme', () => {
    const { container } = render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    const sideSection = container.querySelector('.bg-blue-50')
    expect(sideSection).toBeInTheDocument()
  })

  it('shows against side with red color scheme', () => {
    const againstVoteData: VoteConfirmationData = {
      ...mockVoteData,
      selectedSide: 'against',
    }

    const { container } = render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={againstVoteData}
      />
    )

    const sideSection = container.querySelector('.bg-red-50')
    expect(sideSection).toBeInTheDocument()
  })

  it('displays side indicator', () => {
    render(
      <VoteConfirmationDialog
        open
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        data={mockVoteData}
      />
    )

    expect(screen.getByText('FOR')).toBeInTheDocument()
  })
})
