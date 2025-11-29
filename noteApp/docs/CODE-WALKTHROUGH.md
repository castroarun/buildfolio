# NoteApp Code Walkthrough

A practical guide to understanding modern web development through this codebase.

---

## Table of Contents

1. [Tech Stack Overview](#1-tech-stack-overview)
2. [Project Structure](#2-project-structure)
3. [How Next.js Works](#3-how-nextjs-works)
4. [Authentication Flow](#4-authentication-flow)
5. [Component Architecture](#5-component-architecture)
6. [State Management](#6-state-management)
7. [Database Operations](#7-database-operations)
8. [API Routes](#8-api-routes)
9. [The Editor Feature](#9-the-editor-feature)
10. [Third-Party Integrations](#10-third-party-integrations)
11. [Styling with Tailwind](#11-styling-with-tailwind)
12. [Key Patterns to Learn](#12-key-patterns-to-learn)

---

## 1. Tech Stack Overview

### What We're Using

| Technology | What It Does |
|------------|--------------|
| **Next.js 16** | React framework with server-side rendering, file-based routing |
| **React 19** | UI library for building components |
| **TypeScript** | JavaScript with static types (catches errors before runtime) |
| **Tailwind CSS** | Utility-first CSS framework |
| **Supabase** | Backend-as-a-Service (database + auth) |
| **Tiptap** | Rich text editor built on ProseMirror |

### Why This Stack?

- **Next.js** handles both frontend AND backend in one project
- **TypeScript** prevents bugs by checking types at compile time
- **Supabase** gives us a PostgreSQL database + authentication without managing servers
- **Tailwind** lets us style components without writing separate CSS files

---

## 2. Project Structure

```
noteApp/
├── app/                    # Next.js App Router (SERVER-SIDE)
│   ├── page.tsx           # Home page - first thing users see
│   ├── layout.tsx         # Wraps all pages (like a template)
│   └── auth/callback/     # OAuth callback handler
│
├── ui/                     # CLIENT-SIDE components
│   ├── components/        # React components
│   ├── contexts/          # React Context for shared state
│   └── styles/            # CSS files
│
├── lib/                    # Shared utilities & business logic
│   ├── supabase.ts        # Server-side Supabase client
│   ├── supabase-client.ts # Browser-side Supabase client
│   └── database.types.ts  # Database TypeScript types
│
└── types.ts               # TypeScript type definitions
```

### The Key Insight: Server vs Client

In modern Next.js, code runs in two places:

1. **Server** (`app/` folder) - Runs on the server, can access databases directly
2. **Client** (`ui/` folder) - Runs in the browser, handles user interactions

---

## 3. How Next.js Works

### File-Based Routing

Instead of configuring routes manually, Next.js uses the file system:

```
app/page.tsx              → yoursite.com/
app/auth/callback/route.ts → yoursite.com/auth/callback
app/api/jira/create/route.ts → yoursite.com/api/jira/create
```

### Server Components (Default)

Files in `app/` are **Server Components** by default. They run on the server:

```typescript
// app/page.tsx - This runs on the SERVER
export default async function Home() {
  // We can directly access the database here!
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Decide what to show based on auth status
  if (!user) {
    return <AuthSignIn />  // Show login page
  }

  return <MainApp user={user} />  // Show the app
}
```

**Why Server Components?**
- Direct database access (no API calls needed)
- Secure (code never reaches the browser)
- Better performance (less JavaScript sent to browser)

### Client Components

For interactive UI, we use **Client Components**. Mark them with `'use client'`:

```typescript
// ui/components/MainApp.tsx
'use client'  // <-- This tells Next.js: "Run this in the browser"

import { useState } from 'react'

export function MainApp({ user }: MainAppProps) {
  // useState only works in client components!
  const [panels, setPanels] = useState({ left: true, right: true })

  return (
    <div>
      <button onClick={() => setPanels(p => ({ ...p, left: !p.left }))}>
        Toggle Panel
      </button>
      {/* ... */}
    </div>
  )
}
```

**When to use Client Components:**
- User interactions (clicks, typing)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)

---

## 4. Authentication Flow

### The Journey: User Signs In

```
1. User visits site
        ↓
2. Server checks: "Are they logged in?"
        ↓ (No)
3. Show Google Sign-in button
        ↓ (User clicks)
4. Redirect to Google's login page
        ↓ (User approves)
5. Google sends user back with a "code"
        ↓
6. Our server exchanges code for a session
        ↓
7. User is now logged in!
```

### Step 1: Check Authentication

```typescript
// app/page.tsx
export default async function Home() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <AuthSignIn />  // Not logged in
  }

  return <MainApp user={user} />  // Logged in!
}
```

### Step 2: Sign-in Button

```typescript
// ui/components/Auth.tsx
export function AuthSignIn() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient()

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Where Google should send the user after login
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  )
}
```

### Step 3: Handle the Callback

```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get('code')

  if (code) {
    const supabase = await createServerComponentClient()
    // Exchange the temporary code for a real session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Send user back to home page (now logged in!)
  return NextResponse.redirect(new URL(request.url).origin)
}
```

---

## 5. Component Architecture

### Component Hierarchy

```
MainApp (orchestrator)
├── Header
│   ├── Logo/Title
│   ├── Theme Toggle
│   └── UserMenu
├── NotesPanel (left sidebar)
│   ├── Search Input
│   ├── New Note Button
│   └── Note List
├── Editor (center)
│   ├── Title Input
│   ├── Tiptap Editor
│   └── JiraDetectionPanel
└── RightPanel (templates)
    └── Template Icons
```

### How Components Communicate

**Parent passes data DOWN via props:**

```typescript
// MainApp.tsx
function MainApp({ user }) {
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)

  return (
    <>
      <NotesPanel
        userId={user.id}
        onSelectNote={(id) => setCurrentNoteId(id)}  // Callback
      />
      <Editor
        noteId={currentNoteId}  // Pass current note
      />
    </>
  )
}
```

**Child notifies parent UP via callbacks:**

```typescript
// NotesPanel.tsx
function NotesPanel({ userId, onSelectNote }) {
  return (
    <div>
      {notes.map(note => (
        <button
          key={note.id}
          onClick={() => onSelectNote(note.id)}  // Call parent's function
        >
          {note.title}
        </button>
      ))}
    </div>
  )
}
```

### Real Example: Note Selection

```typescript
// 1. User clicks note in NotesPanel
<button onClick={() => onSelectNote(note.id)}>

// 2. MainApp receives the callback
onSelectNote={(id) => setCurrentNoteId(id)}

// 3. State updates, React re-renders
// 4. Editor receives new noteId prop
<Editor noteId={currentNoteId} />

// 5. Editor's useEffect runs
useEffect(() => {
  if (noteId) {
    loadNote(noteId)  // Fetch from database
  }
}, [noteId])
```

---

## 6. State Management

### Local State with useState

For state that belongs to one component:

```typescript
// Editor.tsx
const [note, setNote] = useState<Note | null>(null)
const [isSaving, setIsSaving] = useState(false)
const [lastSaved, setLastSaved] = useState<string | null>(null)
```

### Shared State with Context

For state that many components need (like theme):

```typescript
// ui/contexts/ThemeContext.tsx

// 1. Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// 2. Create a provider component
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// 3. Create a hook to use it
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

**Using the theme anywhere:**

```typescript
// Any component
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
    </button>
  )
}
```

### Database as Source of Truth

Notes are stored in Supabase. Local state just caches what we fetched:

```typescript
// Fetch from database → Update local state
const { data } = await supabase.from('notes').select('*')
setNotes(data)

// User edits → Save to database → Update local state
await supabase.from('notes').update({ title: newTitle })
setNote({ ...note, title: newTitle })
```

---

## 7. Database Operations

### Two Supabase Clients

**Server Client** (for `app/` folder):

```typescript
// lib/supabase.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set(name, value, options) },
        remove(name, options) { cookieStore.set(name, '', options) },
      },
    }
  )
}
```

**Browser Client** (for `ui/` folder):

```typescript
// lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### CRUD Operations

**Create (INSERT):**

```typescript
const { data, error } = await supabase
  .from('notes')
  .insert({
    user_id: userId,
    title: 'Untitled',
    content: '',
    plain_text: ''
  })
  .select()  // Return the inserted row
  .single()  // Expect exactly one result
```

**Read (SELECT):**

```typescript
// Get all user's notes
const { data } = await supabase
  .from('notes')
  .select('*')
  .eq('user_id', userId)           // WHERE user_id = ?
  .eq('is_deleted', false)         // AND is_deleted = false
  .order('updated_at', { ascending: false })  // ORDER BY updated_at DESC
```

**Update:**

```typescript
const { error } = await supabase
  .from('notes')
  .update({
    title: newTitle,
    content: newContent,
    updated_at: new Date().toISOString()
  })
  .eq('id', noteId)  // WHERE id = ?
```

**Delete (Soft Delete):**

```typescript
// We don't actually delete - we mark as deleted
const { error } = await supabase
  .from('notes')
  .update({
    is_deleted: true,
    deleted_at: new Date().toISOString()
  })
  .eq('id', noteId)
```

### Row Level Security (RLS)

Supabase enforces access rules at the database level:

```sql
-- Users can only see their own notes
CREATE POLICY "Users can only access own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id);
```

Even if someone hacks our API, they still can't access other users' data!

---

## 8. API Routes

### What Are API Routes?

Backend endpoints that run on the server. Perfect for:
- Handling sensitive operations
- Integrating with external APIs
- Processing webhooks

### Creating an API Route

```typescript
// app/api/jira/create/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse the request body
    const { noteId, task } = await request.json()

    // 3. Do the work
    const issue = await createJiraIssue(task)

    // 4. Return the response
    return NextResponse.json({ issue }, { status: 200 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

### Calling API Routes from Components

```typescript
// In a client component
const createJiraTask = async (task) => {
  const response = await fetch('/api/jira/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteId: currentNote.id, task })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }

  return response.json()
}
```

---

## 9. The Editor Feature

### Tiptap: A Modern Rich Text Editor

Tiptap is built on ProseMirror, giving us:
- Formatting (bold, italic, headings)
- Lists (bullet, numbered)
- Links and more

### Setting Up Tiptap

```typescript
// Editor.tsx
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

function Editor({ noteId }) {
  const editor = useEditor({
    extensions: [
      StarterKit,  // Basic formatting
      Placeholder.configure({
        placeholder: 'Start typing your note...'
      }),
    ],
    content: '',  // Initial content
    onUpdate: ({ editor }) => {
      // Called every time content changes
      handleAutoSave(editor.getHTML(), editor.getText())
    },
  })

  return <EditorContent editor={editor} />
}
```

### Auto-Save with Debouncing

We don't want to save on every keystroke - that's too many database calls. Instead, we **debounce**: wait until the user stops typing.

```typescript
const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null)

const handleAutoSave = (html: string, plainText: string) => {
  // Cancel any pending save
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }

  // Schedule a new save in 2 seconds
  const timeout = setTimeout(() => {
    saveNote(html, plainText)
  }, 2000)

  setSaveTimeout(timeout)
}

// Timeline:
// User types "H" → Schedule save for 2s
// User types "e" (0.5s later) → Cancel previous, schedule new save for 2s
// User types "l" (0.3s later) → Cancel previous, schedule new save for 2s
// User stops typing...
// 2 seconds pass → Save "Hel" to database
```

### Loading a Note

```typescript
useEffect(() => {
  async function loadNote() {
    if (!noteId) return

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (data && editor) {
      setNote(data)
      editor.commands.setContent(data.content)  // Load into editor
      setEditableTitle(data.title)
    }
  }

  loadNote()
}, [noteId])  // Run whenever noteId changes
```

---

## 10. Third-Party Integrations

### Jira Integration

**Flow:**
1. User types with special keywords (`TASK:`, `DESC:`, `AC:`)
2. JiraDetectionPanel parses the content
3. User clicks "Create in Jira"
4. API route creates the issue

**Parsing Keywords:**

```typescript
const parseJiraTask = (content: string) => {
  // Only detect if explicit keywords present
  if (!content.match(/TASK:|DESC:|AC:/i)) return null

  const summary = content.match(/TASK:\s*(.+)/i)?.[1]?.trim()
  const description = content.match(/DESC:\s*(.+)/i)?.[1]?.trim()

  return summary ? { summary, description } : null
}
```

**Making the API Call:**

```typescript
// lib/jira.ts
export async function createJiraIssue(config, task) {
  const authHeader = Buffer.from(
    `${config.email}:${config.apiToken}`
  ).toString('base64')

  const response = await fetch(
    `https://${config.domain}/rest/api/3/issue`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: config.defaultProject },
          summary: task.summary,
          description: task.description,
          issuetype: { name: 'Task' },
        }
      }),
    }
  )

  return response.json()
}
```

---

## 11. Styling with Tailwind

### How Tailwind Works

Instead of writing CSS classes, you apply utility classes directly:

```tsx
// Traditional CSS approach:
<button className="submit-button">Submit</button>
// .submit-button { background: blue; padding: 8px 16px; border-radius: 4px; }

// Tailwind approach:
<button className="bg-blue-500 px-4 py-2 rounded">Submit</button>
```

### Theme with CSS Variables

We use CSS variables for theming:

```css
/* ui/styles/globals.css */
:root {
  --color-background: #FFFFFF;
  --color-text-primary: #1F2937;
}

.dark {
  --color-background: #111827;
  --color-text-primary: #F9FAFB;
}
```

**Using in Tailwind config:**

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      background: 'var(--color-background)',
      'text-primary': 'var(--color-text-primary)',
    }
  }
}
```

**Using in components:**

```tsx
<div className="bg-background text-text-primary">
  Content that adapts to theme
</div>
```

---

## 12. Key Patterns to Learn

### Pattern 1: Optimistic Updates

Update UI immediately, sync with database in background:

```typescript
const handlePin = async (noteId) => {
  // 1. Update UI immediately (optimistic)
  setNotes(prev => prev.map(n =>
    n.id === noteId ? { ...n, is_pinned: true } : n
  ))

  // 2. Sync with database
  const { error } = await supabase
    .from('notes')
    .update({ is_pinned: true })
    .eq('id', noteId)

  // 3. Revert if failed
  if (error) {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, is_pinned: false } : n
    ))
  }
}
```

### Pattern 2: Conditional Rendering

Show different UI based on state:

```tsx
function NotesPanel({ notes, isLoading }) {
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (notes.length === 0) {
    return <div>No notes yet. Create one!</div>
  }

  return (
    <ul>
      {notes.map(note => <NoteItem key={note.id} note={note} />)}
    </ul>
  )
}
```

### Pattern 3: Custom Hooks

Extract reusable logic into hooks:

```typescript
// useNotes.ts (hypothetical)
function useNotes(userId: string) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNotes() {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)

      setNotes(data || [])
      setIsLoading(false)
    }

    fetchNotes()
  }, [userId])

  return { notes, isLoading, setNotes }
}

// Usage in component
function NotesPanel({ userId }) {
  const { notes, isLoading } = useNotes(userId)
  // ...
}
```

### Pattern 4: Error Boundaries (Concept)

Handle errors gracefully:

```typescript
try {
  const { data, error } = await supabase.from('notes').select('*')

  if (error) throw error

  setNotes(data)
} catch (error) {
  console.error('Failed to fetch notes:', error)
  setError('Unable to load notes. Please try again.')
}
```

---

## Quick Reference

### Common Supabase Operations

```typescript
// Insert
await supabase.from('table').insert({ column: value })

// Select
await supabase.from('table').select('*').eq('column', value)

// Update
await supabase.from('table').update({ column: value }).eq('id', id)

// Delete
await supabase.from('table').delete().eq('id', id)
```

### Common React Patterns

```typescript
// State
const [value, setValue] = useState(initial)

// Effect (runs after render)
useEffect(() => {
  // do something
}, [dependency])  // runs when dependency changes

// Callback (memoized function)
const handleClick = useCallback(() => {
  // do something
}, [dependency])

// Context
const value = useContext(MyContext)
```

### TypeScript Basics

```typescript
// Type for an object
interface Note {
  id: string
  title: string
  content: string
}

// Type for props
interface Props {
  note: Note
  onSave: (note: Note) => void
}

// Component with typed props
function Editor({ note, onSave }: Props) {
  // ...
}
```

---

## Summary

This codebase demonstrates:

1. **Next.js App Router** - Server and client components working together
2. **TypeScript** - Type safety throughout
3. **Supabase** - Authentication + database without backend setup
4. **React patterns** - State, effects, context, callbacks
5. **Modern styling** - Tailwind CSS with CSS variables for theming
6. **Rich text editing** - TipTap editor with templates

The key architectural insight: **Server components for data fetching, client components for interactivity**. This separation gives us the best of both worlds - security and performance from the server, rich user experience from the client.

---

*Document created: 2025-11-29*
