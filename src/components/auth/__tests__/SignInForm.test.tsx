/**
 * SignInForm Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { SignInForm } from '../SignInForm'

// Mock the auth action
jest.mock('@/app/actions/auth', () => ({
  signIn: jest.fn(),
}))

import { signIn } from '@/app/actions/auth'

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<SignInForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument()
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<SignInForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('disables form fields during loading', async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {}))

    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument()
    })
  })

  it('calls signIn with correct data on successful submission', async () => {
    mockSignIn.mockResolvedValue({
      success: true,
      redirectTo: '/dashboard',
    })

    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      })
    })
  })

  it('shows error message on sign in failure', async () => {
    mockSignIn.mockResolvedValue({
      success: false,
      error: 'Invalid credentials',
    })

    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback on successful sign in', async () => {
    const onSuccess = jest.fn()
    mockSignIn.mockResolvedValue({
      success: true,
      redirectTo: '/dashboard',
    })

    render(<SignInForm onSuccess={onSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('shows error message on unexpected error', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'))

    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
    })
  })

  it('renders forgot password link', () => {
    render(<SignInForm />)

    const forgotPasswordLink = screen.getByText(/forgot password\?/i)
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('renders sign up link', () => {
    render(<SignInForm />)

    const signUpLink = screen.getByText(/sign up/i)
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/signup')
  })
})
