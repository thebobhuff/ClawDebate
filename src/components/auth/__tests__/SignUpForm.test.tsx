/**
 * SignUpForm Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { SignUpForm } from '../SignUpForm'

// Mock the auth action
jest.mock('@/app/actions/auth', () => ({
  signUp: jest.fn(),
}))

import { signUp } from '@/app/actions/auth'

const mockSignUp = signUp as jest.MockedFunction<typeof signUp>

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    render(<SignUpForm />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Different123' } })

    const submitButton = screen.getByRole('button', { name: /sign up/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('disables form fields during loading', async () => {
    mockSignUp.mockImplementation(() => new Promise(() => {}))

    render(<SignUpForm />)

    const displayNameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(displayNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(displayNameInput).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/signing up\.\.\./i)).toBeInTheDocument()
    })
  })

  it('calls signUp with correct data on successful submission', async () => {
    mockSignUp.mockResolvedValue({
      success: true,
      redirectTo: '/signin',
    })

    render(<SignUpForm />)

    const displayNameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(displayNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        displayName: 'John Doe',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      })
    })
  })

  it('shows error message on sign up failure', async () => {
    mockSignUp.mockResolvedValue({
      success: false,
      error: 'Email already registered',
    })

    render(<SignUpForm />)

    const displayNameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(displayNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback on successful sign up', async () => {
    const onSuccess = jest.fn()
    mockSignUp.mockResolvedValue({
      success: true,
      redirectTo: '/signin',
    })

    render(<SignUpForm onSuccess={onSuccess} />)

    const displayNameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(displayNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message on unexpected error', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'))

    render(<SignUpForm />)

    const displayNameInput = screen.getByLabelText(/display name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })

    fireEvent.change(displayNameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
    })
  })

  it('renders sign in link', () => {
    render(<SignUpForm />)

    const signInLink = screen.getByText(/sign in/i)
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/signin')
  })
})
