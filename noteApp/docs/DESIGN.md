# Note App - Product Design Document

**Version:** 1.0
**Date:** 2025-11-16
**Status:** Draft - Awaiting Approval

---

## Objective

Build a clean, simple, and fast note-taking web application that integrates seamlessly with Jira and Gmail. Users can create and manage notes with rich text formatting, automatically convert notes into Jira tasks using smart detection, and email notes directly via Gmail. The app syncs notes with local markdown files for offline access and version control.

**Target User:** Developers and professionals who need quick note-taking with task management integration.

**Key Benefit:** Single place to capture thoughts, create tasks, and share information without switching between multiple tools.

---

## Capabilities List

1. **User Authentication** - Google OAuth login
2. **Note Management** - Create, edit, delete, and organize notes
3. **Rich Text Editing** - Professional formatting with Tiptap editor
4. **Smart Jira Integration** - Auto-detect and create Jira tasks from notes
5. **Gmail Integration** - Email notes and task summaries
6. **Markdown File Sync** - Bidirectional sync with local .md files
7. **Tags & Organization** - Categorize and search notes
8. **Note Sharing** - Collaborate with others (view/edit permissions)

---

## Capabilities Explanation

### 1. User Authentication

**How to Achieve:**
- Use Supabase Auth with Google OAuth provider
- User clicks "Sign in with Google" button
- Redirect to Google consent screen
- Return with session token stored in httpOnly cookie
- Middleware protects authenticated routes

**API/Tech:**
- Supabase Auth API
- Google OAuth 2.0
- Next.js middleware for route protection

**Implementation:**
- `app/api/google/auth/route.ts` - Initiates OAuth flow
- `app/api/google/callback/route.ts` - Handles OAuth callback
- `lib/supabase/client.ts` - Supabase client setup
- `ui/components/auth/LoginButton.tsx` - Login UI component

---

### 2. Note Management

**How to Achieve:**
- Store notes in Supabase PostgreSQL database
- Each note has title, content (Tiptap JSON), tags, timestamps
- CRUD operations via Next.js API routes
- Auto-save every 2 seconds (debounced)
- Soft delete (moved to trash, permanent delete after 30 days)
- Keep last 10 versions for history

**API/Tech:**
- Supabase PostgreSQL with Row Level Security (RLS)
- REST API endpoints for CRUD
- Full-text search using PostgreSQL's `to_tsvector`

**Implementation:**
- `app/api/notes/route.ts` - GET (list), POST (create)
- `app/api/notes/[id]/route.ts` - GET (single), PUT (update), DELETE
- `ui/components/notes/NoteList.tsx` - Display notes
- `ui/components/notes/NoteCard.tsx` - Individual note card
- `ui/hooks/useNotes.ts` - Notes data management hook

---

### 3. Rich Text Editing

**How to Achieve:**
- Integrate Tiptap editor (ProseMirror-based)
- Toolbar with formatting options: headings, bold, italic, lists, code blocks
- Content stored as Tiptap JSON (structured, queryable)
- Also store markdown representation for export/sync
- Keyboard shortcuts (Ctrl+B for bold, etc.)
- Auto-save with debouncing

**API/Tech:**
- Tiptap editor library
- ProseMirror document format
- Markdown conversion utilities

**Implementation:**
- `ui/components/editor/Tiptap.tsx` - Main editor component
- `ui/components/editor/Toolbar.tsx` - Formatting toolbar
- `ui/components/editor/extensions/` - Custom Tiptap extensions
- `lib/utils/markdown.ts` - Tiptap ↔ Markdown conversion

---

### 4. Smart Jira Integration

**How to Achieve:**
- Hybrid parsing system: explicit keywords OR smart detection
- **Explicit mode:** User writes `TASK:`, `DESC:`, `AC:`, `COMMENT:`
- **Smart mode:** Detect task keywords (fix, add, create, implement)
- Parse note content into structured Jira task data
- Convert Tiptap JSON to Atlassian Document Format (ADF)
- Create/update Jira issues via REST API
- Store link between note and Jira issue
- User configures Jira domain, email, API token (encrypted)

**Detection Keywords:**
- **TASK:** fix, add, update, create, implement, build, refactor, remove, delete
- **AC:** must, should, verify, ensure, check that, needs to
- **COMMENT:** note:, todo:, fixme:, check, investigate

**API Know-How:**
- **Jira REST API v3**
- **Authentication:** Basic Auth (email + API token)
- **Create Issue:** `POST https://{domain}/rest/api/3/issue`
- **Update Issue:** `PUT https://{domain}/rest/api/3/issue/{issueKey}`
- **Get Issue:** `GET https://{domain}/rest/api/3/issue/{issueKey}`
- **Format:** Atlassian Document Format (ADF) - JSON structure similar to ProseMirror
- **Headers:** `Authorization: Basic {base64(email:apiToken)}`, `Content-Type: application/json`

**Implementation:**
- `lib/jira/parser.ts` - Hybrid parsing logic
- `lib/jira/client.ts` - Jira API client
- `lib/jira/adf-converter.ts` - Convert Tiptap JSON to ADF
- `app/api/jira/create/route.ts` - Create Jira issue endpoint
- `app/api/jira/update/route.ts` - Update Jira issue endpoint
- `app/api/jira/config/route.ts` - Save/get Jira configuration
- `ui/components/jira/JiraTaskCreator.tsx` - UI for task creation
- `ui/components/jira/JiraConfig.tsx` - Jira settings UI

---

### 5. Gmail Integration

**How to Achieve:**
- User authorizes Gmail API access (OAuth 2.0)
- Store access token and refresh token (encrypted)
- Compose email with note content
- Convert note to HTML or attach as .md file
- Encode email as RFC 2822 format, then base64url
- Send via Gmail API
- Support email templates with variables: `{{noteTitle}}`, `{{jiraLink}}`
- Rate limit: 50 emails/hour per user

**API Know-How:**
- **Gmail API v1**
- **Authentication:** OAuth 2.0
- **Scope:** `https://www.googleapis.com/auth/gmail.send`
- **Send Email:** `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send`
- **Format:** RFC 2822 email message, base64url encoded
- **Headers:** `Authorization: Bearer {accessToken}`, `Content-Type: application/json`
- **Auto-refresh:** Use refresh token when access token expires

**Implementation:**
- `lib/gmail/client.ts` - Gmail API client
- `lib/gmail/email-builder.ts` - Construct RFC 2822 emails
- `app/api/gmail/auth/route.ts` - OAuth flow
- `app/api/gmail/send/route.ts` - Send email endpoint
- `app/api/gmail/config/route.ts` - Save/get Gmail config
- `ui/components/gmail/EmailComposer.tsx` - Email compose UI
- `ui/components/gmail/GmailConfig.tsx` - Gmail settings UI

---

### 6. Markdown File Sync

**How to Achieve:**
- Use File System Access API (Chrome/Edge only)
- User selects local folder
- App reads all .md files from folder
- Parse markdown with YAML frontmatter (title, tags, date)
- Create notes in database for each file
- Set up file watcher to detect changes
- Bidirectional sync:
  - Local file changes → Update database
  - App note changes → Write to file
- Conflict resolution: Last-write-wins (for MVP)
- Sync status indicators: ✓ synced, ⟳ syncing, ⚠️ conflict

**API Know-How:**
- **File System Access API** (browser API)
- `window.showDirectoryPicker()` - Select folder
- `FileSystemFileHandle.getFile()` - Read file
- `FileSystemFileHandle.createWritable()` - Write file
- Requires HTTPS in production
- Fallback: Manual download/upload for unsupported browsers

**Markdown File Format:**
```markdown
---
title: Note Title
tags: [work, important]
created: 2025-11-16T10:30:00Z
---

# Note Title

Content with **formatting**.
```

**Implementation:**
- `lib/fileSystem/client.ts` - File System Access API wrapper
- `lib/fileSystem/watcher.ts` - File change detection
- `lib/utils/markdown.ts` - Markdown ↔ Tiptap conversion
- `ui/components/sync/FileSyncConfig.tsx` - Folder selection UI
- `ui/hooks/useFileSync.ts` - File sync logic hook

---

### 7. Tags & Organization

**How to Achieve:**
- Each note can have multiple tags (array of strings)
- Create new tags on-the-fly
- Color-coded tags for visual distinction
- Filter notes by tags (multi-select)
- Full-text search across title and content
- Tag autocomplete when typing
- PostgreSQL full-text search for performance

**API/Tech:**
- Supabase PostgreSQL with GIN index for full-text search
- Array data type for tags
- `to_tsvector` for search indexing

**Implementation:**
- `app/api/notes/route.ts` - Include search/filter params
- `ui/components/notes/TagManager.tsx` - Tag creation/editing
- `ui/components/notes/TagFilter.tsx` - Filter by tags UI
- `ui/components/notes/SearchBar.tsx` - Search input
- `ui/hooks/useSearch.ts` - Search logic hook

---

### 8. Note Sharing

**How to Achieve:**
- User clicks "Share" on a note
- Enter email address(es) of recipients
- Choose permission: View or Edit
- Send email invitation with link to note
- Recipient must sign in with Google to access
- Real-time collaboration using Supabase Realtime
- See other users' cursors and presence
- Row Level Security ensures only authorized users can access

**API/Tech:**
- Supabase Realtime for live updates
- Supabase RLS policies for access control
- Email invitations via Gmail API (or Supabase Edge Functions)

**Implementation:**
- `app/api/notes/share/route.ts` - Share note endpoint
- `ui/components/notes/ShareDialog.tsx` - Share UI
- `ui/components/notes/CollaboratorsList.tsx` - Show collaborators
- `ui/hooks/useRealtime.ts` - Real-time sync hook
- `lib/supabase/rls-policies.sql` - Row Level Security setup

---

## File Structure (Consolidated)

```
noteApp/
├── app/
│   ├── page.tsx                          # Main landing/dashboard page
│   ├── layout.tsx                        # Root layout with auth context
│   └── api/                              # API routes (server-side)
│       ├── notes.ts                      # All notes endpoints (CRUD, share, search)
│       ├── jira.ts                       # All Jira endpoints (create, update, config)
│       ├── gmail.ts                      # All Gmail endpoints (send, auth, config)
│       └── auth.ts                       # All auth endpoints (Google OAuth, callback)
│
├── ui/                                   # All UI components, hooks, styles
│   ├── components/
│   │   ├── Notes.tsx                     # All note components (List, Card, Editor, Tags, Search, Share)
│   │   ├── Editor.tsx                    # Tiptap editor with toolbar and extensions
│   │   ├── Integrations.tsx              # Jira & Gmail components (configs, task creator, email composer)
│   │   ├── Auth.tsx                      # Authentication components (login, logout)
│   │   └── Common.tsx                    # Reusable UI (Button, Input, Modal, etc.)
│   ├── hooks.ts                          # All custom hooks (useNotes, useAuth, useDebounce, etc.)
│   └── styles/
│       └── globals.css                   # Global styles (Tailwind)
│
├── lib/                                  # Business logic & utilities
│   ├── supabase.ts                       # Supabase client (browser & server) + RLS policies
│   ├── jira.ts                           # Jira API client + parser + ADF converter
│   ├── gmail.ts                          # Gmail API client + email builder
│   ├── fileSync.ts                       # File System API + watcher + markdown conversion
│   └── utils.ts                          # All utilities (validation, date formatting, etc.)
│
├── types.ts                              # All TypeScript interfaces (Note, User, Jira, Gmail)
│
├── docs/                                 # Documentation
│   ├── DESIGN.md                         # This file
│   ├── TEST-PLAN.csv                     # Test plan
│   ├── UI-PROTOTYPES.md                  # UI wireframes and navigation flow
│   ├── WALKTHROUGH.md                    # Technical walkthrough (post-completion)
│   ├── NOTE-APP-PRD.md                   # Product requirements
│   └── NOTE-APP-PROJECT.md               # Project guidelines
│
├── tests/                                # Test files
│   ├── unit.test.ts                      # All unit tests
│   ├── integration.test.ts               # All integration tests
│   └── e2e.test.ts                       # All end-to-end tests
│
├── .claude/
│   ├── instructions.md                   # Project instructions
│   └── coding-standards.md               # Coding standards
│
├── tailwind.config.ts                    # Tailwind configuration
├── next.config.js                        # Next.js configuration
├── tsconfig.json                         # TypeScript configuration
├── package.json                          # Dependencies
└── .env.local                            # Environment variables (gitignored)
```

**File Consolidation Logic:**

1. **API Routes:** Combined all related endpoints into single files
   - `notes.ts` - All note operations (list, create, update, delete, share, search)
   - `jira.ts` - All Jira operations (create issue, update, config)
   - `gmail.ts` - All Gmail operations (send email, OAuth, config)
   - `auth.ts` - All authentication (Google OAuth, callback, logout)

2. **UI Components:** Grouped by feature area
   - `Notes.tsx` - All note-related components in one file
   - `Editor.tsx` - Complete editor with toolbar
   - `Integrations.tsx` - Jira + Gmail components together
   - `Auth.tsx` - Authentication UI
   - `Common.tsx` - Shared UI components

3. **Hooks:** Single file for all custom hooks
   - `hooks.ts` - All hooks in one file with exports

4. **Business Logic:** Combined by integration type
   - `supabase.ts` - Database client and operations
   - `jira.ts` - Complete Jira integration logic
   - `gmail.ts` - Complete Gmail integration logic
   - `fileSync.ts` - File sync + markdown conversion
   - `utils.ts` - All utility functions

5. **Types:** Single file for all TypeScript definitions
   - `types.ts` - All interfaces and types

6. **Tests:** Three consolidated test files
   - `unit.test.ts` - All unit tests
   - `integration.test.ts` - All integration tests
   - `e2e.test.ts` - All end-to-end tests

**Total Files Reduced:** From 50+ files to ~20 core files

---

## Design System

### Color Palette (Minimal Monochrome)

**Light Mode:**
- Background: `#FFFFFF` (White)
- Text Primary: `#1F2937` (Gray-900)
- Text Secondary: `#6B7280` (Gray-500)
- Accent: `#3B82F6` (Blue-500)
- Success: `#10B981` (Green-500)
- Warning: `#F59E0B` (Amber-500)
- Borders: `#E5E7EB` (Gray-200)

**Dark Mode:**
- Background: `#0F172A` (Slate-900)
- Text Primary: `#F9FAFB` (Gray-50)
- Text Secondary: `#9CA3AF` (Gray-400)
- Accent: `#3B82F6` (Blue-500)
- Success: `#10B981` (Green-500)
- Warning: `#F59E0B` (Amber-500)
- Borders: `#1E293B` (Slate-800)

### Typography
- **Font:** System font stack (fast loading)
- **Headings:** `font-semibold` or `font-bold`
- **Body:** `font-normal`
- **Code:** Monospace font

### Spacing
- Use Tailwind's default spacing scale (4px increments)
- Consistent padding/margins throughout

---

## Database Schema

```sql
-- notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  markdown TEXT,
  tags TEXT[],
  is_markdown_file BOOLEAN DEFAULT FALSE,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Full-text search index
CREATE INDEX notes_search_idx ON notes
USING GIN(to_tsvector('english', title || ' ' || markdown));

-- note_versions table
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

-- shared_notes table
CREATE TABLE shared_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id),
  shared_with_email TEXT NOT NULL,
  permission TEXT CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- jira_links table
CREATE TABLE jira_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  jira_issue_key TEXT NOT NULL,
  jira_issue_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_integrations table
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Performance Considerations

1. **Fast Loading:**
   - Minimal color palette (no complex gradients)
   - System fonts (no web font loading)
   - Next.js code splitting
   - Tailwind JIT (only used CSS)
   - Optimized images

2. **Quick to Use:**
   - Auto-save (no manual save needed)
   - Keyboard shortcuts
   - Fast search with PostgreSQL full-text
   - Debounced inputs
   - Optimistic UI updates

3. **Clean & Simple:**
   - Minimal UI elements
   - Clear visual hierarchy
   - No distractions
   - Focus on content

---

## Security

1. **Authentication:** Google OAuth only, no passwords
2. **Row Level Security:** Supabase RLS on all tables
3. **API Security:** Server-side routes only for integrations
4. **Encrypted Storage:** Jira/Gmail credentials encrypted
5. **HTTPS Only:** Enforce in production
6. **Rate Limiting:** Prevent abuse

---

## Next Steps

1. Review this design document
2. Provide feedback/corrections
3. Approve to proceed
4. Create Test Plan (TEST-PLAN.csv)
5. Final review before implementation

---

**Document Status:** Draft - Awaiting Review
**Prepared by:** AI Assistant
**Review Date:** [Pending]
