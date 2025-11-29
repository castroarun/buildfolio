# NoteApp - Product Requirements Document

**Version:** 2.0 (Final)
**Date:** 2025-11-29
**Status:** Implemented

---

## Overview

NoteApp is a **web-based note-taking application** featuring rich text editing, cloud storage, and intelligent organization tools. Built with modern web technologies, it provides a clean, distraction-free writing experience with powerful formatting capabilities.

---

## Core Features (Implemented)

### 1. Rich Text Editing
- **TipTap Editor** (ProseMirror-based) with professional formatting
- **Text Formatting:** Bold (Ctrl+B), Italic (Ctrl+I), Underline (Ctrl+U)
- **Headings:** Toggle heading style (Alt+H)
- **Lists:** Bullet lists and numbered lists with proper indentation
- **Keyboard Shortcuts:** Full keyboard navigation support
- **Auto-save:** Changes saved automatically after 1 second of inactivity
- **Word Count:** Live word count display in editor footer

### 2. Note Management
- **Create Notes:** Quick note creation with "New Note" button
- **Edit Notes:** Click any note to open in editor
- **Delete Notes:** Soft delete with confirmation dialog
- **Pin Notes:** Pin important notes to top of list
- **Search:** Full-text search across note titles and content
- **Preview:** Note preview in sidebar showing first lines of content

### 3. Templates System
Six pre-built templates for common use cases:
- **Weekend Planner:** Plan Saturday and Sunday activities
- **Goal Tracker:** Track goals with action steps and progress
- **Lecture Notes:** Structured notes for learning
- **Meeting Notes:** Agenda, discussion points, and action items
- **Daily Journal:** Gratitude and reflection prompts
- **Project Ideas:** Brainstorm and organize project concepts

Templates appear as icons in the right panel with hover descriptions.

### 4. User Authentication
- **Supabase Auth:** Email/password authentication
- **Session Persistence:** Stay logged in across browser sessions
- **User Profile:** Display user email in header
- **Secure Logout:** Clean session termination

### 5. Cloud Storage
- **Supabase Database:** PostgreSQL backend
- **Real-time Sync:** Changes persist immediately
- **User Isolation:** Notes visible only to owner (Row Level Security)

### 6. Theme Support
- **Dark Mode:** Toggle between light and dark themes
- **Persistent Preference:** Theme choice saved in browser
- **CSS Variables:** Consistent theming across all components

---

## User Interface

### Layout Structure
```
+----------------------------------------------------------+
|  NoteApp                              [Theme] [User Menu] |
+----------------------------------------------------------+
|          |                              |                 |
| Notes    |      Editor                  | Templates       |
| List     |                              | Panel           |
| (280px)  |    (flexible width)          | (48px)          |
|          |                              |                 |
| - Search |  Title: Note Title          | [Weekend]       |
| - New    |  ----------------------      | [Goal]          |
|          |  Content area with           | [Lecture]       |
| [Note 1] |  formatting toolbar          | [Meeting]       |
| [Note 2] |                              | [Journal]       |
| [Note 3] |  [B] [I] [U] [H] [•] [1.] [?]| [Project]       |
|          |                              |                 |
|          |  ----------------------      |                 |
|          |  Words: 42                   |                 |
+----------------------------------------------------------+
```

### Components
- **Header:** App title, theme toggle, user menu
- **Left Panel (NotesPanel):** Collapsible notes list with search and filtering
- **Center (Editor):** Main content area with formatting toolbar
- **Right Panel (RightPanel):** Template icons with hover tooltips

---

## Technical Architecture

### Technology Stack
- **Framework:** Next.js 16.0.3 with Turbopack
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS 4.x with CSS variable theming
- **Editor:** TipTap 2.x (ProseMirror-based)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Ready for Vercel

### File Structure
```
noteApp/
├── app/                    # Next.js app router
│   ├── globals.css         # Root CSS import
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page (auth check)
├── docs/                   # Documentation
│   ├── NOTE-APP-PRD.md     # This document
│   ├── BUILD-INSTRUCTIONS.md
│   ├── DESIGN.md
│   └── ...
├── lib/                    # Utility libraries
│   ├── supabase-client.ts  # Browser Supabase client
│   └── supabase-server.ts  # Server Supabase client
├── tests/                  # Test files
├── types.ts                # TypeScript definitions
└── ui/                     # UI components
    ├── components/
    │   ├── Auth.tsx        # Auth forms & user menu
    │   ├── Editor.tsx      # TipTap editor
    │   ├── MainApp.tsx     # Main app layout
    │   ├── NotesPanel.tsx  # Notes list sidebar
    │   └── RightPanel.tsx  # Templates panel
    ├── contexts/
    │   └── ThemeContext.tsx
    └── styles/
        └── globals.css     # Tailwind + custom CSS
```

### Database Schema
```sql
-- notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  plain_text TEXT DEFAULT '',
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id);
```

---

## Keyboard Shortcuts

### Text Formatting
| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+U | Underline |
| Alt+H | Toggle Heading |

### Lists
| Shortcut | Action |
|----------|--------|
| Ctrl+Shift+8 | Bullet List |
| Ctrl+Shift+7 | Numbered List |
| Tab | Indent list item |
| Shift+Tab | Outdent list item |

### Editor
| Shortcut | Action |
|----------|--------|
| Ctrl+A | Select All |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |

---

## Performance Metrics

- **Page Load:** < 2 seconds
- **Auto-save Delay:** 1 second debounce
- **Search:** Real-time filtering as you type
- **Theme Toggle:** Instant, no reload required

---

## Future Enhancements (Not Implemented)

The following features were planned but not implemented in this version:
- Jira Integration
- Gmail Integration
- Markdown File Sync
- Tags System
- Note Sharing
- Real-time Collaboration
- Version History

---

## Glossary

- **TipTap:** ProseMirror-based rich text editor
- **Supabase:** Open-source Firebase alternative (PostgreSQL + Auth)
- **RLS:** Row Level Security (database access control)
- **Turbopack:** Next.js bundler (Webpack replacement)

---

**End of PRD**
