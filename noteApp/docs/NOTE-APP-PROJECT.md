# Note App with Jira & Gmail Integration - Project Guidelines

## Project Overview

A web-based note-taking application with advanced integrations for Jira task management and Gmail communication. Built with modern tech stack and focus on simplicity and productivity.

**Primary Goal:** Learn full-stack development while building a production-ready app to showcase AI-assisted development journey on LinkedIn.

---

## Tech Stack Decisions

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** React 18+
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **Rich Text Editor:** Tiptap (ProseMirror-based, extensible)
- **State Management:** React Context + hooks (Zustand if needed for complex state)
- **Forms:** React Hook Form + Zod validation

### Backend
- **API:** Next.js API routes (serverless functions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (Google OAuth)
- **Storage:** Supabase Storage (for file attachments)
- **Real-time:** Supabase Realtime (for collaborative features)

### Integrations
- **Jira:** Jira REST API v3 (Atlassian)
- **Gmail:** Gmail API (Google Workspace)
- **File System:** File System Access API (for local .md sync)

### Development Tools
- **Package Manager:** pnpm (faster, more efficient)
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** Vitest + React Testing Library
- **E2E Testing:** Playwright (later phase)
- **Git Hooks:** Husky + lint-staged

---

## Project Structure

```
note-app/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (auth)/            # Auth-protected routes
│   │   ├── (public)/          # Public routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── notes/            # Note-specific components
│   │   ├── editor/           # Rich text editor components
│   │   ├── jira/             # Jira integration components
│   │   └── gmail/            # Gmail integration components
│   ├── lib/                   # Utilities and helpers
│   │   ├── supabase/         # Supabase client & queries
│   │   ├── jira/             # Jira API client
│   │   ├── gmail/            # Gmail API client
│   │   ├── parser/           # Paragraph parsing logic
│   │   └── utils/            # General utilities
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   ├── config/                # App configuration
│   └── styles/                # Global styles
├── public/                    # Static assets
├── tests/                     # Test files
├── .env.local                 # Environment variables (gitignored)
└── NOTE-APP-PROJECT.md       # This file
```

---

## Coding Standards & Style Guidelines

### General Principles
1. **Clarity over Cleverness** - Write code that's easy to understand
2. **DRY (Don't Repeat Yourself)** - Extract reusable logic
3. **Single Responsibility** - Each function/component does one thing well
4. **Consistent Naming** - Follow conventions throughout
5. **Type Safety** - Leverage TypeScript fully

### File & Folder Naming
- **Components:** PascalCase (e.g., `NoteEditor.tsx`)
- **Utilities/Helpers:** camelCase (e.g., `formatDate.ts`)
- **Hooks:** camelCase with `use` prefix (e.g., `useNotes.ts`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types:** PascalCase (e.g., `Note.ts`, `JiraTask.ts`)

### TypeScript Guidelines
```typescript
// Use interfaces for object shapes
interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

// Use types for unions, primitives, complex types
type NoteStatus = 'draft' | 'published' | 'archived'

// Always type function parameters and returns
function createNote(data: CreateNoteInput): Promise<Note> {
  // implementation
}

// Use const assertions for literal types
const JIRA_KEYWORDS = {
  TASK: 'TASK',
  DESC: 'DESC',
  AC: 'AC',
  COMMENT: 'COMMENT'
} as const

// Avoid 'any' - use 'unknown' if type is truly unknown
function parseData(input: unknown): ParsedData {
  // implementation with type guards
}
```

### Component Structure
```typescript
// 1. Imports (grouped: React, external libs, internal)
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useNotes } from '@/hooks/useNotes'

// 2. Types/Interfaces
interface NoteCardProps {
  note: Note
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

// 3. Component
export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  // 3a. Hooks (state, context, custom hooks)
  const [isExpanded, setIsExpanded] = useState(false)

  // 3b. Effects
  useEffect(() => {
    // side effects
  }, [])

  // 3c. Event handlers
  const handleEdit = () => {
    onEdit(note.id)
  }

  // 3d. Render helpers (if needed)
  const renderTags = () => {
    return note.tags.map(tag => <Tag key={tag}>{tag}</Tag>)
  }

  // 3e. Return JSX
  return (
    <div className="rounded-lg border p-4">
      {/* Clean, readable JSX */}
    </div>
  )
}
```

### API Route Structure
```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // 1. Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Business logic
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    // 3. Return response
    return NextResponse.json({ notes: data })

  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
```

### Error Handling
```typescript
// Use try-catch for async operations
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  // Log error with context
  console.error('Operation failed:', error)

  // Return user-friendly error
  throw new Error('Failed to complete operation. Please try again.')
}

// Use error boundaries for component errors
// Create AppErrorBoundary component for global error handling
```

### Comments & Documentation
```typescript
// Use JSDoc for public functions/components
/**
 * Parses note content to extract Jira task information
 * @param content - The note content to parse
 * @returns Parsed Jira task data or null if no task found
 */
function parseJiraTask(content: string): JiraTaskData | null {
  // implementation
}

// Inline comments for complex logic only
// Avoid obvious comments like: const name = user.name // Get user name

// Use TODO comments for future work
// TODO: Add validation for email format
// FIXME: Handle edge case when tags array is empty
```

### Tailwind CSS Guidelines
```typescript
// Use Tailwind utility classes, avoid inline styles
<div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">

// Extract repeated patterns into components
// Instead of repeating "rounded-lg border p-4 shadow"
// Create a Card component

// Use Tailwind config for custom colors/spacing
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      primary: '#...',
      secondary: '#...',
    }
  }
}

// Group classes logically: layout → spacing → colors → typography → effects
className="flex flex-col gap-4 p-6 bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg"
```

---

## Feature Specifications

### 1. Core Note Management

**Features:**
- Create, read, update, delete notes
- Rich text editing with Tiptap editor
- Auto-save (debounced)
- Note versioning/history
- Tag system for organization
- Search and filter

**Database Schema (Supabase):**
```sql
-- notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Tiptap JSON format
  markdown TEXT, -- Markdown export of content
  tags TEXT[],
  is_markdown_file BOOLEAN DEFAULT FALSE,
  file_path TEXT, -- For synced .md files
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- note_versions table (for history)
CREATE TABLE note_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  UNIQUE(user_id, name)
);
```

### 2. Authentication (Google OAuth)

**Implementation:**
- Supabase Auth with Google provider
- Session management
- Protected routes (middleware)
- User profile management

**User Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent
3. Returns to app with session
4. Session stored in cookie (httpOnly)

### 3. Sharing & Collaboration

**Features:**
- Share note via email invitation
- View-only vs Edit permissions
- Collaborative editing (real-time with Supabase Realtime)
- Share link generation

**Database Schema:**
```sql
-- shared_notes table
CREATE TABLE shared_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_with_email TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Markdown File Sync

**Implementation:**
- Use File System Access API (Chrome/Edge)
- User grants permission to folder
- App monitors .md files in folder
- Bidirectional sync:
  - Local file changes → Update note in DB
  - Note changes in app → Update local file
- File watcher for changes

**Technical Considerations:**
- File System Access API only works in secure contexts (HTTPS)
- Requires user permission (one-time per folder)
- Handle conflicts (last-write-wins or merge strategies)

**Flow:**
1. User clicks "Sync with folder"
2. File picker dialog opens
3. User selects folder
4. App reads all .md files
5. Creates notes for each file
6. Sets up file watchers
7. Changes sync bidirectionally

### 5. Hybrid Paragraph Parsing for Jira

**Two Modes:**

**Mode 1: Explicit Keywords**
```
TASK: Fix authentication bug
DESC: Users unable to login with Google OAuth
AC: Google OAuth flow completes successfully
AC: User redirected to dashboard after login
COMMENT: Check redirect URI configuration
```

**Mode 2: Smart Detection**
```
Fix authentication bug               ← "Fix" detected → TASK
Users unable to login with OAuth     ← Following task → DESC
Must complete OAuth flow             ← "Must" detected → AC
Check redirect URI configuration     ← Standalone → COMMENT
```

**Detection Keywords:**
```typescript
const DETECTION_PATTERNS = {
  TASK: ['fix', 'add', 'update', 'create', 'implement', 'refactor', 'remove'],
  DESC: [], // Description follows task
  AC: ['must', 'should', 'verify', 'ensure', 'check that'],
  COMMENT: ['note:', 'todo:', 'fixme:', 'check']
}
```

**Parser Logic:**
1. Split content into paragraphs
2. Check each paragraph's first line
3. If starts with explicit keyword (TASK:, DESC:) → use that
4. Else, check first word against detection patterns
5. Build structured Jira task object
6. Validate before sending to Jira API

**Parsing Rules:**
- Empty lines separate sections
- Multiple AC: lines → array of acceptance criteria
- Everything after last AC → Comment/Update
- Unrecognized paragraphs → Added to description

### 6. Jira Integration

**Features:**
- Parse note content for task data
- Create Jira issues via API
- Update existing Jira issues
- Link note to Jira issue
- Sync status updates from Jira
- Support multiple Jira projects

**Configuration:**
```typescript
interface JiraConfig {
  domain: string // e.g., "yourcompany.atlassian.net"
  email: string
  apiToken: string
  defaultProject: string
  defaultIssueType: string // e.g., "Task", "Story"
}
```

**Database Schema:**
```sql
-- jira_links table
CREATE TABLE jira_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  jira_issue_key TEXT NOT NULL, -- e.g., "PROJ-123"
  jira_issue_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_integrations table
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL, -- 'jira', 'gmail'
  config JSONB NOT NULL, -- Encrypted credentials
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Endpoints:**
- `POST /api/jira/create` - Create Jira issue from note
- `PUT /api/jira/update/:issueKey` - Update existing issue
- `GET /api/jira/issues` - Fetch user's Jira issues
- `POST /api/jira/config` - Save Jira configuration

### 7. Gmail Integration

**Features:**
- Email note content
- Email Jira task summary
- Attach note as .md file
- Email to multiple recipients
- Template support

**Implementation:**
- Gmail API with OAuth 2.0
- Send emails via API
- Handle attachments

**API Endpoints:**
- `POST /api/gmail/send` - Send email with note content
- `GET /api/gmail/auth` - Initiate Gmail OAuth flow

---

## Development Phases & Milestones

### Phase 1: Foundation (Weeks 1-3)
- [ ] Next.js project setup with TypeScript
- [ ] Tailwind v3 configuration
- [ ] Supabase project setup
- [ ] Google OAuth implementation
- [ ] Basic note CRUD (no rich editor yet)
- [ ] Database schema creation
- [ ] Basic UI components

### Phase 2: Rich Text Editor (Weeks 4-5)
- [ ] Integrate Tiptap editor
- [ ] Custom editor extensions
- [ ] Formatting toolbar
- [ ] Auto-save functionality
- [ ] Note versioning

### Phase 3: Tags & Organization (Week 6)
- [ ] Tag system implementation
- [ ] Search functionality
- [ ] Filter by tags
- [ ] Note organization UI

### Phase 4: Markdown File Sync (Weeks 7-8)
- [ ] File System Access API integration
- [ ] .md file import/export
- [ ] Bidirectional sync logic
- [ ] Conflict resolution
- [ ] File watcher implementation

### Phase 5: Sharing (Week 9)
- [ ] Share note functionality
- [ ] Permission management
- [ ] Email invitations
- [ ] Real-time collaboration (Supabase Realtime)

### Phase 6: Jira Integration (Weeks 10-11)
- [ ] Paragraph parser implementation
- [ ] Jira API client
- [ ] Create/update Jira issues
- [ ] Jira configuration UI
- [ ] Issue linking

### Phase 7: Gmail Integration (Week 12)
- [ ] Gmail API integration
- [ ] Email sending functionality
- [ ] Email templates
- [ ] Attachment handling

### Phase 8: Polish & Testing (Weeks 13-14)
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Error handling refinement
- [ ] Documentation

### Phase 9: Deployment (Week 15)
- [ ] Production environment setup
- [ ] Vercel deployment
- [ ] Environment variables configuration
- [ ] Domain setup
- [ ] Monitoring & analytics

---

## LinkedIn Content Plan

### Post 1 (After Phase 2): "Building in Public"
- Share project overview
- Show rich text editor demo
- Explain Next.js + Supabase stack choice
- Invite feedback

### Post 2 (After Phase 4): "Markdown File Sync"
- Technical deep dive on File System Access API
- Demo bidirectional sync
- Challenges faced and solutions

### Post 3 (After Phase 6): "Smart Jira Integration"
- Show hybrid parsing system
- Demo task creation from notes
- AI-assisted development insights

### Post 4 (After Phase 9): "Complete Journey"
- Full app showcase
- Lessons learned
- What AI development taught me
- Open source release?

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google OAuth (handled by Supabase)
# Configured in Supabase dashboard

# Jira (user-specific, stored encrypted in DB)
# Not in .env

# Gmail API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Security Considerations

1. **API Keys:** Never expose in client-side code
2. **Row Level Security (RLS):** Enable on all Supabase tables
3. **Input Validation:** Validate all user inputs (Zod schemas)
4. **XSS Prevention:** Sanitize rich text content
5. **CSRF Protection:** Use Next.js built-in protections
6. **Encrypted Storage:** Encrypt integration credentials in DB
7. **Rate Limiting:** Implement on API routes
8. **Secure Headers:** Configure Next.js security headers

---

## Testing Strategy

### Unit Tests (Vitest)
- Utility functions
- Parsing logic
- API utilities

### Integration Tests
- API route handlers
- Database operations
- External API integrations

### Component Tests (React Testing Library)
- UI components
- User interactions
- Form validations

### E2E Tests (Playwright)
- Critical user flows
- Authentication
- Note creation → Jira task creation

---

## Performance Optimization

1. **Code Splitting:** Next.js automatic code splitting
2. **Lazy Loading:** Dynamic imports for heavy components
3. **Image Optimization:** Next.js Image component
4. **Caching:** Browser cache + Supabase cache
5. **Debouncing:** Auto-save, search
6. **Virtual Scrolling:** For long note lists
7. **Database Indexing:** Proper indexes on Supabase tables

---

## Accessibility (a11y)

1. **Keyboard Navigation:** Full keyboard support
2. **Screen Reader:** ARIA labels and roles
3. **Color Contrast:** WCAG AA compliance
4. **Focus Management:** Visible focus indicators
5. **Semantic HTML:** Proper heading hierarchy

---

## Future Enhancements (Beyond MVP)

- Mobile app (React Native)
- Browser extension
- Slack integration
- Notion import/export
- AI-powered note summarization
- Voice notes
- Drawing/sketching support
- Offline mode (PWA)

---

## References & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Tiptap Docs](https://tiptap.dev/docs)
- [Jira API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Gmail API](https://developers.google.com/gmail/api)

### Learning Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)

---

## Notes for Claude AI

When working on this project:

1. **Always refer to this document** for tech stack, coding standards, and architecture decisions
2. **Follow the coding style guidelines** strictly - consistency is key
3. **Ask for clarification** if requirements are ambiguous
4. **Prioritize type safety** - leverage TypeScript fully
5. **Write tests** alongside implementation
6. **Keep components small** - split into smaller pieces if > 200 lines
7. **Document complex logic** with comments
8. **Consider performance** - avoid premature optimization but don't ignore obvious issues
9. **Security first** - validate inputs, sanitize outputs, protect sensitive data
10. **User experience matters** - think about loading states, error messages, edge cases

**Development Approach:**
- Start with database schema and API design
- Build API routes before UI components
- Test each feature thoroughly before moving to next
- Incremental commits with clear messages
- Regular progress updates

**When in doubt:**
- Refer to official documentation
- Check existing patterns in codebase
- Ask the developer (user) for clarification

---

**Document Version:** 1.0
**Last Updated:** 2025-11-16
**Project Status:** Planning Phase
