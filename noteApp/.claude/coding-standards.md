# Coding Standards & Best Practices

**Purpose:** Reusable coding guidelines for TypeScript/React/Next.js projects

**Last Updated:** 2025-11-16

---

## General Principles

1. **Clarity over Cleverness** - Write code that's easy to understand
2. **DRY (Don't Repeat Yourself)** - Extract reusable logic
3. **Single Responsibility** - Each function/component does one thing well
4. **Consistent Naming** - Follow conventions throughout
5. **Type Safety** - Leverage TypeScript fully
6. **Security First** - Validate inputs, sanitize outputs, protect sensitive data
7. **Test Thoroughly** - Write tests alongside implementation

---

## File & Folder Naming Conventions

### Components
- **PascalCase** for React components: `NoteEditor.tsx`, `UserProfile.tsx`
- **Group by feature** when possible: `components/notes/NoteCard.tsx`

### Utilities & Helpers
- **camelCase** for functions: `formatDate.ts`, `validateEmail.ts`
- **Descriptive names** that indicate purpose

### Hooks
- **camelCase** with `use` prefix: `useNotes.ts`, `useAuth.ts`, `useDebounce.ts`

### Constants
- **UPPER_SNAKE_CASE**: `API_ENDPOINTS.ts`, `ERROR_MESSAGES.ts`
- **Group related constants** in single file

### Types & Interfaces
- **PascalCase**: `Note.ts`, `User.ts`, `JiraTask.ts`
- **Suffix with `Type` if needed** to avoid conflicts: `NoteType.ts`

---

## TypeScript Guidelines

### Use Interfaces for Object Shapes
```typescript
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
}

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  userId: string
  createdAt: Date
  updatedAt: Date
}
```

### Use Types for Unions, Primitives, Complex Types
```typescript
type Status = 'draft' | 'published' | 'archived'
type Permission = 'view' | 'edit' | 'admin'
type ID = string | number
```

### Always Type Function Parameters and Returns
```typescript
// Good
function createUser(data: CreateUserInput): Promise<User> {
  // implementation
}

// Bad
function createUser(data: any): any {
  // implementation
}
```

### Use Const Assertions for Literal Types
```typescript
const CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT: 5000,
  API_VERSION: 'v1'
} as const

// Type is: { readonly MAX_RETRIES: 3, readonly TIMEOUT: 5000, readonly API_VERSION: "v1" }
```

### Avoid `any` - Use `unknown` Instead
```typescript
// Good
function parseData(input: unknown): ParsedData {
  if (typeof input === 'string') {
    return JSON.parse(input)
  }
  throw new Error('Invalid input')
}

// Bad
function parseData(input: any): any {
  return JSON.parse(input)
}
```

### Use Type Guards
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  )
}

function processUser(data: unknown) {
  if (isUser(data)) {
    // data is typed as User here
    console.log(data.email)
  }
}
```

### Utility Types
```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude specific properties
type UserWithoutId = Omit<User, 'id'>

// Record - create object type with specific keys
type UserMap = Record<string, User>
```

---

## Component Structure (React)

### Standard Component Template
```typescript
// 1. Imports (grouped: React, external libs, internal)
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNotes } from '@/hooks/useNotes'
import { formatDate } from '@/lib/utils/formatDate'

// 2. Types/Interfaces
interface ComponentProps {
  title: string
  onSave: (data: FormData) => void
  initialData?: FormData
}

// 3. Component
export function Component({ title, onSave, initialData }: ComponentProps) {
  // 3a. Hooks (state, context, custom hooks)
  const [isLoading, setIsLoading] = useState(false)
  const { data, error } = useNotes()

  // 3b. Effects
  useEffect(() => {
    // side effects
  }, [])

  // 3c. Event handlers
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 3d. Render helpers (if needed)
  const renderContent = () => {
    if (error) return <ErrorState />
    if (!data) return <LoadingState />
    return <Content data={data} />
  }

  // 3e. Early returns for loading/error states
  if (isLoading) return <Spinner />

  // 3f. Main render
  return (
    <div className="container">
      <h1>{title}</h1>
      {renderContent()}
      <Button onClick={handleSubmit}>Save</Button>
    </div>
  )
}
```

### Component Best Practices
- **Keep components small** - split if > 200 lines
- **Extract logic to hooks** when reusable
- **Memoize expensive computations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passing to children
- **Use proper dependency arrays** in `useEffect`
- **Handle loading and error states** explicitly

---

## API Route Structure (Next.js)

### Standard API Route Template
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schema
const RequestSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string(),
  tags: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const validatedData = RequestSchema.parse(body)

    // 3. Business logic
    const { data, error } = await supabase
      .from('notes')
      .insert({
        ...validatedData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) throw error

    // 4. Return response
    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    // 5. Error handling
    console.error('Error creating note:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
```

### API Route Best Practices
- **Always authenticate** before processing requests
- **Validate inputs** using Zod or similar
- **Use try-catch** for error handling
- **Return appropriate status codes** (200, 201, 400, 401, 404, 500)
- **Log errors** with context for debugging
- **Sanitize error messages** before sending to client
- **Use consistent response format**

---

## Error Handling

### Async Operations
```typescript
// Use try-catch for async operations
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    // Re-throw with user-friendly message
    throw new Error('Unable to load data. Please try again.')
  }
}
```

### Error Boundaries (React)
```typescript
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>
    }

    return this.props.children
  }
}
```

### Custom Error Classes
```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
```

---

## Comments & Documentation

### JSDoc for Public APIs
```typescript
/**
 * Formats a date according to the specified format
 * @param date - The date to format
 * @param format - The format string (default: 'yyyy-MM-dd')
 * @returns Formatted date string
 * @throws {Error} If date is invalid
 * @example
 * formatDate(new Date(), 'MM/dd/yyyy')
 * // Returns: "11/16/2025"
 */
function formatDate(date: Date, format = 'yyyy-MM-dd'): string {
  // implementation
}
```

### Inline Comments
```typescript
// Good - explains WHY, not WHAT
// Use binary search because array is sorted and can be very large
const index = binarySearch(sortedArray, target)

// Bad - explains WHAT (code already shows this)
// Loop through array
for (let i = 0; i < array.length; i++) {
  // ...
}
```

### TODO Comments
```typescript
// TODO: Add pagination support
// FIXME: Handle edge case when user has no notes
// NOTE: This is a temporary workaround until API v2 is ready
// HACK: Quick fix for Safari bug, needs proper solution
```

### Avoid Over-Commenting
```typescript
// Bad - unnecessary comments
const name = user.name // Get the user's name
const age = user.age // Get the user's age

// Good - self-documenting code
const { name, age } = user
```

---

## Tailwind CSS Guidelines

### Use Utility Classes
```typescript
// Good
<div className="flex items-center justify-between p-4 rounded-lg shadow-md">

// Bad (inline styles)
<div style={{ display: 'flex', padding: '1rem', borderRadius: '0.5rem' }}>
```

### Logical Class Grouping
Group classes by category for readability:
```typescript
// Layout → Spacing → Colors → Typography → Effects
className="flex flex-col gap-4 p-6 bg-white text-gray-900 text-lg font-medium rounded-lg shadow-md hover:shadow-lg transition-shadow"
```

### Extract Repeated Patterns
```typescript
// Instead of repeating:
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
<button className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">

// Create a Button component:
<Button variant="primary">Click me</Button>
```

### Use Tailwind Config for Custom Values
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
}

// Usage
<div className="bg-primary-500 p-18">
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Grid layout
</div>
```

---

## Security Best Practices

### Input Validation
```typescript
// Always validate user input
import { z } from 'zod'

const EmailSchema = z.string().email()
const PasswordSchema = z.string().min(8).max(100)

function validateEmail(email: string): boolean {
  try {
    EmailSchema.parse(email)
    return true
  } catch {
    return false
  }
}
```

### XSS Prevention
```typescript
// Sanitize HTML content
import DOMPurify from 'dompurify'

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  })
}
```

### Environment Variables
```typescript
// Never expose secrets in client code
// Good - server-side only
const apiKey = process.env.SECRET_API_KEY

// Bad - exposed to client
const apiKey = process.env.NEXT_PUBLIC_SECRET_API_KEY
```

### SQL Injection Prevention
```typescript
// Use parameterized queries (Supabase does this automatically)
// Good
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// Bad - raw SQL with user input
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
```

### Rate Limiting
```typescript
// Implement rate limiting for API routes
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Process request
}
```

---

## Testing Strategy

### Unit Tests (Functions & Utilities)
```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-11-16')
    expect(formatDate(date, 'MM/dd/yyyy')).toBe('11/16/2025')
  })

  it('should use default format when not specified', () => {
    const date = new Date('2025-11-16')
    expect(formatDate(date)).toBe('2025-11-16')
  })

  it('should throw error for invalid date', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow()
  })
})
```

### Component Tests (React Testing Library)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when loading', () => {
    render(<Button isLoading>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### E2E Tests (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('user can create a note', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:3000')

  // Click new note button
  await page.click('button:has-text("New Note")')

  // Fill in note
  await page.fill('[placeholder="Title"]', 'My Test Note')
  await page.fill('[placeholder="Content"]', 'This is test content')

  // Save note
  await page.click('button:has-text("Save")')

  // Verify note appears in list
  await expect(page.locator('text=My Test Note')).toBeVisible()
})
```

---

## Performance Optimization

### Code Splitting & Lazy Loading
```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### Memoization
```typescript
import { useMemo, useCallback } from 'react'

function ExpensiveComponent({ data, onItemClick }) {
  // Memoize expensive computation
  const processedData = useMemo(() => {
    return data.map(item => expensiveOperation(item))
  }, [data])

  // Memoize callback to prevent re-renders
  const handleClick = useCallback((id: string) => {
    onItemClick(id)
  }, [onItemClick])

  return <div>{/* render */}</div>
}
```

### Debouncing & Throttling
```typescript
import { useCallback, useEffect, useState } from 'react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
function SearchInput() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    // Only searches after user stops typing for 500ms
    if (debouncedQuery) {
      performSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />
}
```

### Virtual Scrolling
```typescript
// For long lists, use virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual'

function LongList({ items }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  })

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Accessibility (a11y)

### Semantic HTML
```typescript
// Good - semantic HTML
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// Bad - div soup
<div>
  <div>
    <div><a href="/home">Home</a></div>
  </div>
</div>
```

### ARIA Labels
```typescript
<button aria-label="Close dialog">
  <X /> {/* Icon only */}
</button>

<input
  type="search"
  aria-label="Search notes"
  placeholder="Search..."
/>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### Keyboard Navigation
```typescript
function Menu() {
  const handleKeyDown = (e: KeyboardEvent) => {
    switch(e.key) {
      case 'ArrowDown':
        focusNextItem()
        break
      case 'ArrowUp':
        focusPreviousItem()
        break
      case 'Enter':
      case ' ':
        selectCurrentItem()
        break
      case 'Escape':
        closeMenu()
        break
    }
  }

  return (
    <div
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* menu items */}
    </div>
  )
}
```

### Focus Management
```typescript
import { useRef, useEffect } from 'react'

function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) {
      // Focus close button when modal opens
      closeButtonRef.current?.focus()
    }
  }, [isOpen])

  return (
    <dialog aria-modal="true" role="dialog">
      <button ref={closeButtonRef} onClick={onClose}>
        Close
      </button>
      {/* modal content */}
    </dialog>
  )
}
```

### Color Contrast
```typescript
// Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
// Use tools like https://webaim.org/resources/contrastchecker/

// Good
<div className="bg-gray-900 text-white"> // High contrast

// Bad
<div className="bg-gray-400 text-gray-500"> // Low contrast
```

---

## Git Commit Messages

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no logic change)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add Google OAuth login

Implement Google OAuth authentication using Supabase Auth.
Users can now sign in with their Google account.

Closes #123

---

fix(notes): resolve auto-save race condition

Fixed issue where rapid edits could cause data loss due to
concurrent save operations. Implemented debouncing and request
cancellation.

Fixes #456

---

docs(readme): update installation instructions

Added steps for environment variable setup and database migration.
```

---

## Code Review Checklist

### Before Submitting PR
- [ ] Code follows project coding standards
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Types are properly defined (no `any`)
- [ ] Functions are documented with JSDoc
- [ ] Error handling is implemented
- [ ] Loading states are shown for async operations
- [ ] Accessibility requirements met
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Git commit messages are clear and descriptive

### Reviewing Others' Code
- [ ] Does code solve the problem?
- [ ] Is it readable and maintainable?
- [ ] Are there any edge cases not handled?
- [ ] Is error handling adequate?
- [ ] Are there security vulnerabilities?
- [ ] Is performance acceptable?
- [ ] Are tests comprehensive?
- [ ] Is documentation clear?

---

**End of Coding Standards**

These standards are meant to be adapted and evolved as the project grows. Always prioritize code clarity, maintainability, and security over strict adherence to rules.
