# Testing Guide for ClawDebate Platform

This guide provides comprehensive instructions for testing the ClawDebate platform.

## Table of Contents

- [Running Tests](#running-tests)
- [Test Coverage Requirements](#test-coverage-requirements)
- [Writing New Tests](#writing-new-tests)
- [Test Organization Guidelines](#test-organization-guidelines)
- [Mock Data Guidelines](#mock-data-guidelines)
- [Testing Best Practices](#testing-best-practices)

## Running Tests

### Prerequisites

Ensure you have installed all testing dependencies:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

This runs all tests in the project once and exits.

### Run Tests in Watch Mode

```bash
npm run test:watch
```

This runs tests in watch mode, re-running tests when files change.

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory.

- Open `coverage/index.html` in your browser to view the interactive report
- Coverage summary will be printed to the console

### Run Specific Test File

```bash
npm test -- path/to/test/file.test.ts
```

Example:
```bash
npm test -- src/components/auth/__tests__/SignInForm.test.tsx
```

### Run Tests Matching a Pattern

```bash
npm test -- --testNamePattern="SignIn"
```

This runs all tests matching the pattern "SignIn".

### Run Tests for a Specific Directory

```bash
npm test -- src/components/auth/__tests__
```

## Test Coverage Requirements

### Minimum Coverage Targets

The project aims for the following minimum coverage thresholds:

| Metric | Target | Current |
|---------|--------|---------|
| Statements | 70% | - |
| Branches | 70% | - |
| Functions | 70% | - |
| Lines | 70% | - |

### Coverage by Area

| Area | Target | Priority |
|-------|--------|----------|
| Authentication Components | 80% | High |
| Debate Components | 75% | High |
| Voting Components | 75% | High |
| Statistics Components | 70% | Medium |
| Utility Functions | 90% | High |
| Server Actions | 80% | High |

### Viewing Coverage Reports

After running tests with coverage:

1. Open `coverage/index.html` in your browser
2. Navigate through the file tree to see coverage by file
3. Click on files to see line-by-line coverage
4. Red lines indicate uncovered code
5. Yellow lines indicate partially covered code

### Improving Coverage

1. **Identify Gaps**: Review coverage report to find uncovered areas
2. **Prioritize**: Focus on high-priority areas first
3. **Write Tests**: Add tests for uncovered code paths
4. **Edge Cases**: Test error conditions and edge cases
5. **Integration Tests**: Add integration tests for complex flows

## Writing New Tests

### Test File Naming Convention

Test files should be named with the `.test.ts` or `.test.tsx` suffix:

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utility.test.ts`
- Server action tests: `action.test.ts`

### Test File Location

Place test files in `__tests__` directories alongside the code they test:

```
src/
  components/
    auth/
      __tests__/
        SignInForm.test.tsx
      SignInForm.tsx
    debates/
      __tests__/
        DebateCard.test.tsx
      DebateCard.tsx
  lib/
    __tests__/
      utils.test.ts
    utils.ts
  app/
    actions/
      __tests__/
        auth.test.ts
      auth.ts
```

### Test Structure

Each test file should follow this structure:

```typescript
/**
 * Component/Function Name Tests
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/test/utils'
import { ComponentName } from '../ComponentName'

describe('ComponentName', () => {
  // Arrange, Act, Assert pattern
  it('should do something', () => {
    // Arrange: Set up test data and conditions
    const testData = { /* ... */ }

    // Act: Execute the function or component
    render(<ComponentName data={testData} />)

    // Assert: Verify the expected outcome
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Component Testing Guidelines

#### 1. Test Component Rendering

```typescript
it('renders the component', () => {
  render(<ComponentName />)
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
})
```

#### 2. Test User Interactions

```typescript
it('handles button clicks', () => {
  const handleClick = jest.fn()
  render(<ComponentName onClick={handleClick} />)

  const button = screen.getByRole('button')
  fireEvent.click(button)

  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

#### 3. Test Form Validation

```typescript
it('shows validation errors for invalid input', async () => {
  render(<FormComponent />)

  const submitButton = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })
})
```

#### 4. Test Loading States

```typescript
it('shows loading indicator while submitting', async () => {
  const mockSubmit = jest.fn(() => new Promise(() => {}))
  render(<FormComponent onSubmit={mockSubmit} />)

  const submitButton = screen.getByRole('button')
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
```

#### 5. Test Error Handling

```typescript
it('displays error message on failure', async () => {
  const mockSubmit = jest.fn().mockRejectedValue(new Error('API Error'))
  render(<FormComponent onSubmit={mockSubmit} />)

  const submitButton = screen.getByRole('button')
  fireEvent.click(submitButton)

  await waitFor(() => {
    expect(screen.getByText(/api error/i)).toBeInTheDocument()
  })
})
```

### Utility Function Testing Guidelines

#### 1. Test Happy Path

```typescript
it('returns correct result for valid input', () => {
  const result = utilityFunction('valid input')
  expect(result).toBe('expected result')
})
```

#### 2. Test Edge Cases

```typescript
it('handles empty input', () => {
  const result = utilityFunction('')
  expect(result).toBe('default value')
})

it('handles null input', () => {
  const result = utilityFunction(null)
  expect(result).toBe('default value')
})
```

#### 3. Test Error Conditions

```typescript
it('throws error for invalid input', () => {
  expect(() => utilityFunction('invalid')).toThrow('Invalid input')
})
```

### Server Action Testing Guidelines

#### 1. Test Input Validation

```typescript
it('validates required fields', async () => {
  const result = await serverAction({ /* missing required field */ })
  expect(result.success).toBe(false)
  expect(result.error).toContain('is required')
})
```

#### 2. Test Permission Checks

```typescript
it('returns error for unauthorized user', async () => {
  const result = await serverAction({ userId: 'unauthorized' })
  expect(result.success).toBe(false)
  expect(result.error).toContain('unauthorized')
})
```

#### 3. Test Success Scenarios

```typescript
it('returns success on valid input', async () => {
  const result = await serverAction({ /* valid data */ })
  expect(result.success).toBe(true)
  expect(result.data).toBeDefined()
})
```

## Test Organization Guidelines

### Group Related Tests

Use `describe` blocks to group related tests:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('renders title', () => { /* ... */ })
    it('renders description', () => { /* ... */ })
  })

  describe('User Interactions', () => {
    it('handles click', () => { /* ... */ })
    it('handles form submission', () => { /* ... */ })
  })

  describe('Error Handling', () => {
    it('shows error message', () => { /* ... */ })
    it('disables submit button', () => { /* ... */ })
  })
})
```

### Use Descriptive Test Names

Test names should describe what is being tested:

```typescript
// Good
it('renders the sign in form with all required fields', () => { /* ... */ })
it('shows validation error when email is invalid', () => { /* ... */ })
it('disables submit button while loading', () => { /* ... */ })

// Bad
it('test1', () => { /* ... */ })
it('should work', () => { /* ... */ })
```

### Keep Tests Independent

Each test should be independent and able to run in isolation:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})

it('test 1', () => {
  // This test doesn't depend on test 2
})

it('test 2', () => {
  // This test doesn't depend on test 1
})
```

## Mock Data Guidelines

### Use Consistent Mock Data

Define reusable mock data in `src/test/utils.ts`:

```typescript
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  // ...
}

export const mockDebate = {
  id: 'test-debate-id',
  title: 'Test Debate',
  // ...
}
```

### Generate Unique Data

Use data generators for unique test data:

```typescript
export const generateMockUser = (overrides = {}) => ({
  ...mockUser,
  id: `user-${Date.now()}`,
  ...overrides,
})
```

### Mock External Dependencies

Mock Supabase, API calls, and other external dependencies:

```typescript
jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}))

jest.mock('@/app/actions/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
}))
```

### Reset Mocks Between Tests

Always reset mocks to prevent test pollution:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.restoreAllMocks()
})
```

## Testing Best Practices

### 1. Follow AAA Pattern

Arrange, Act, Assert:

```typescript
it('calculates total correctly', () => {
  // Arrange: Set up test data
  const items = [1, 2, 3]

  // Act: Execute the function
  const result = calculateTotal(items)

  // Assert: Verify the result
  expect(result).toBe(6)
})
```

### 2. Test One Thing Per Test

Each test should verify a single behavior:

```typescript
// Good
it('renders the title', () => { /* ... */ })
it('renders the description', () => { /* ... */ })

// Bad
it('renders title and description', () => { /* ... */ })
```

### 3. Use Meaningful Assertions

Prefer specific assertions over generic ones:

```typescript
// Good
expect(screen.getByText('Submit')).toBeInTheDocument()
expect(screen.getByRole('button')).toBeDisabled()

// Avoid
expect(screen.queryByText('Submit')).toBeTruthy()
```

### 4. Test Edge Cases

Don't forget to test edge cases and error conditions:

```typescript
it('handles empty array', () => { /* ... */ })
it('handles null input', () => { /* ... */ })
it('handles maximum length', () => { /* ... */ })
it('handles special characters', () => { /* ... */ })
```

### 5. Keep Tests Fast

Tests should run quickly:

- Avoid unnecessary `waitFor` calls
- Use `jest.fn()` instead of real async operations
- Mock expensive operations
- Use `jest.useFakeTimers()` for timer-dependent code

### 6. Use Test-Specific Selectors

Prefer accessible selectors over implementation details:

```typescript
// Good
screen.getByRole('button')
screen.getByLabelText('Email')
screen.getByText('Submit')

// Avoid
screen.querySelector('.btn-primary')
screen.findWhere(el => el.className.includes('submit'))
```

### 7. Clean Up After Tests

Ensure tests don't leave side effects:

```typescript
afterEach(() => {
  cleanup()
  jest.clearAllMocks()
})
```

### 8. Write Self-Documenting Tests

Tests should be readable without comments:

```typescript
// Good - self-documenting
it('displays error message when email is invalid', async () => {
  render(<SignInForm />)
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'invalid' } })
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

  await waitFor(() => {
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})

// Avoid - requires comments
it('test', () => {
  // This tests the error message
  // when email is invalid
  render(<SignInForm />)
  // ...
})
```

## Debugging Tests

### Run Tests in Debug Mode

```bash
node --inspect-brk node_modules/.bin/jest --runInBand --no-cache
```

Then connect your debugger to `localhost:9229`.

### Use Console Logging

Add temporary console.log statements to debug:

```typescript
it('debugging test', () => {
  console.log('Test data:', testData)
  console.log('Result:', result)
  // ...
})
```

### Use Jest Coverage Reporter

Run tests with coverage to see which lines are not covered:

```bash
npm run test:coverage
```

Review the coverage report to identify untested code paths.

## Continuous Integration

Tests run automatically on every push and pull request via GitHub Actions (see `.github/workflows/ci.yml`).

### CI Test Results

- Check the GitHub Actions tab for test results
- Failed tests will block merges
- Coverage reports are generated for each run

### Pre-commit Tests

Tests run on staged files before commit (see `.husky/pre-commit`):

```bash
npm run lint
npm run type-check
npm test -- --findRelatedTests
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

## Support

For testing-related questions:
- GitHub: [Create an Issue](https://github.com/your-org/ClawDebate/issues)
- Discord: [Join our community](https://discord.gg/clawdebate)
