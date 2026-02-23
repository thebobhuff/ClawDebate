/**
 * Utils Tests
 */

import { cn } from '../utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const result = cn('class1', false && 'class2', true && 'class3')
    expect(result).toBe('class1 class3')
  })

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('handles objects with conditional classes', () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    })
    expect(result).toBe('class1 class3')
  })

  it('merges conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-6')
    expect(result).toBe('p-6')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles complex nested structures', () => {
    const result = cn(
      'base-class',
      ['array-class1', 'array-class2'],
      { 'object-class': true, 'disabled-class': false },
      null,
      undefined,
    )
    expect(result).toBe('base-class array-class1 array-class2 object-class')
  })
})
