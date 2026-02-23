/**
 * AgentRegistrationForm Component Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { AgentRegistrationForm } from '../AgentRegistrationForm'

// Mock the auth action
jest.mock('@/app/actions/auth', () => ({
  registerAgent: jest.fn(),
}))

import { registerAgent } from '@/app/actions/auth'

const mockRegisterAgent = registerAgent as jest.MockedFunction<typeof registerAgent>

describe('AgentRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    render(<AgentRegistrationForm />)

    expect(screen.getByLabelText(/agent name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register agent/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty required fields', async () => {
    render(<AgentRegistrationForm />)

    const submitButton = screen.getByRole('button', { name: /register agent/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/agent name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email format', async () => {
    render(<AgentRegistrationForm />)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitButton = screen.getByRole('button', { name: /register agent/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for weak password', async () => {
    render(<AgentRegistrationForm />)

    const passwordInput = screen.getByLabelText(/^password/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })

    const submitButton = screen.getByRole('button', { name: /register agent/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('allows adding capabilities', () => {
    render(<AgentRegistrationForm />)

    const capabilityInput = screen.getByPlaceholderText(/e\.g\., philosophy/i)
    const addButton = screen.getByRole('button', { name: '' })

    fireEvent.change(capabilityInput, { target: { value: 'Philosophy' } })
    fireEvent.click(addButton)

    expect(screen.getByText('Philosophy')).toBeInTheDocument()
    expect(screen.getByText(/1\/10 capabilities/i)).toBeInTheDocument()
  })

  it('allows removing capabilities', () => {
    render(<AgentRegistrationForm />)

    const capabilityInput = screen.getByPlaceholderText(/e\.g\., philosophy/i)
    const addButton = screen.getByRole('button', { name: '' })

    fireEvent.change(capabilityInput, { target: { value: 'Philosophy' } })
    fireEvent.click(addButton)

    const removeButton = screen.getByRole('button', { name: '' })
    fireEvent.click(removeButton)

    expect(screen.queryByText('Philosophy')).not.toBeInTheDocument()
    expect(screen.getByText(/0\/10 capabilities/i)).toBeInTheDocument()
  })

  it('prevents adding more than 10 capabilities', () => {
    render(<AgentRegistrationForm />)

    const capabilityInput = screen.getByPlaceholderText(/e\.g\., philosophy/i)
    const addButton = screen.getByRole('button', { name: '' })

    // Add 10 capabilities
    for (let i = 1; i <= 10; i++) {
      fireEvent.change(capabilityInput, { target: { value: `Capability ${i}` } })
      fireEvent.click(addButton)
    }

    // Try to add 11th capability
    fireEvent.change(capabilityInput, { target: { value: 'Extra Capability' } })
    fireEvent.click(addButton)

    expect(screen.queryByText('Extra Capability')).not.toBeInTheDocument()
    expect(screen.getByText(/10\/10 capabilities/i)).toBeInTheDocument()
  })

  it('disables form fields during loading', async () => {
    mockRegisterAgent.mockImplementation(() => new Promise(() => {}))

    render(<AgentRegistrationForm />)

    const agentNameInput = screen.getByLabelText(/agent name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /register agent/i })

    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(agentNameInput).toBeDisabled()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
      expect(screen.getByText(/registering\.\.\./i)).toBeInTheDocument()
    })
  })

  it('calls registerAgent with correct data on successful submission', async () => {
    mockRegisterAgent.mockResolvedValue({
      success: true,
      apiKey: 'test-api-key',
    })

    render(<AgentRegistrationForm />)

    const agentNameInput = screen.getByLabelText(/agent name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const submitButton = screen.getByRole('button', { name: /register agent/i })

    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegisterAgent).toHaveBeenCalledWith({
        agentName: 'Test Agent',
        email: 'test@example.com',
        password: 'Password123',
        description: 'Test description',
        capabilities: [],
      })
    })
  })

  it('shows error message on registration failure', async () => {
    mockRegisterAgent.mockResolvedValue({
      success: false,
      error: 'Email already registered',
    })

    render(<AgentRegistrationForm />)

    const agentNameInput = screen.getByLabelText(/agent name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /register agent/i })

    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback with API key on successful registration', async () => {
    const onSuccess = jest.fn()
    mockRegisterAgent.mockResolvedValue({
      success: true,
      apiKey: 'test-api-key',
    })

    render(<AgentRegistrationForm onSuccess={onSuccess} />)

    const agentNameInput = screen.getByLabelText(/agent name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /register agent/i })

    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('test-api-key')
    })
  })

  it('shows error message on unexpected error', async () => {
    mockRegisterAgent.mockRejectedValue(new Error('Network error'))

    render(<AgentRegistrationForm />)

    const agentNameInput = screen.getByLabelText(/agent name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password/i)
    const submitButton = screen.getByRole('button', { name: /register agent/i })

    fireEvent.change(agentNameInput, { target: { value: 'Test Agent' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'Password123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument()
    })
  })

  it('adds capability on Enter key press', () => {
    render(<AgentRegistrationForm />)

    const capabilityInput = screen.getByPlaceholderText(/e\.g\., philosophy/i)

    fireEvent.change(capabilityInput, { target: { value: 'Philosophy' } })
    fireEvent.keyPress(capabilityInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    expect(screen.getByText('Philosophy')).toBeInTheDocument()
  })
})
