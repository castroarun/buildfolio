# NoteApp - Build Instructions

This document provides complete instructions for building and running NoteApp from scratch. Use this to recreate the project or onboard new developers.

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 16.0.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Rich Text Editor | TipTap | 2.x |
| Database | Supabase (PostgreSQL) | - |
| Authentication | Supabase Auth | - |
| Package Manager | npm | 10.x |
| Runtime | Node.js | 18+ |

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** (comes with Node.js)
3. **Supabase Account** (free tier works)
4. **Git** (for version control)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd noteApp

# 2. Install dependencies
npm install

# 3. Create environment file
# Copy .env.example to .env.local and fill in Supabase credentials

# 4. Run development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:3000
```

---

## Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard > Project Settings > API

---

## Supabase Setup

### 1. Create Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Wait for database to be ready

### 2. Create Notes Table
Run this SQL in Supabase SQL Editor:

```sql
-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only access their own notes
CREATE POLICY "Users can CRUD own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

### 3. Enable Email Auth
- Go to Authentication > Providers
- Ensure Email is enabled
- Configure email templates if desired

---

## Project Structure

```
noteApp/
├── app/                          # Next.js App Router
│   ├── globals.css               # CSS import
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── page.tsx                  # Main page with auth check
│
├── docs/                         # Documentation
│   ├── BUILD-INSTRUCTIONS.md     # This file
│   ├── NOTE-APP-PRD.md           # Product requirements
│   ├── DESIGN.md                 # Design specifications
│   └── TIME-SPENT.md             # Development time tracking
│
├── lib/                          # Utility libraries
│   ├── supabase-client.ts        # Browser-side Supabase client
│   └── supabase-server.ts        # Server-side Supabase client
│
├── tests/                        # Test files
│   └── ...
│
├── types.ts                      # TypeScript type definitions
│
├── ui/                           # UI layer
│   ├── components/
│   │   ├── Auth.tsx              # Login/Signup forms, UserMenu
│   │   ├── Editor.tsx            # TipTap rich text editor
│   │   ├── MainApp.tsx           # Main app layout
│   │   ├── NotesPanel.tsx        # Left sidebar with notes list
│   │   └── RightPanel.tsx        # Right sidebar with templates
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Dark/Light mode context
│   └── styles/
│       └── globals.css           # Tailwind + custom CSS
│
├── .env.local                    # Environment variables (not in git)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Features Overview

### 1. Authentication (`ui/components/Auth.tsx`)
- Email/password login and signup
- Session management with Supabase
- User menu with logout

### 2. Editor (`ui/components/Editor.tsx`)
- TipTap rich text editor
- Formatting: Bold, Italic, Underline, Heading
- Lists: Bullet and numbered with nesting
- Auto-save with 1-second debounce
- Word count display
- Keyboard shortcuts modal

### 3. Notes Panel (`ui/components/NotesPanel.tsx`)
- Notes list with search
- Pin/unpin notes
- Delete notes (soft delete)
- Create new notes

### 4. Templates (`ui/components/RightPanel.tsx`)
- 6 pre-built templates
- Hover tooltips
- Click to create new note

### 5. Theme (`ui/contexts/ThemeContext.tsx`)
- Dark/Light mode toggle
- Persists in localStorage
- CSS variable-based theming

---

## Key Dependencies

```json
{
  "dependencies": {
    "next": "16.0.3",
    "@supabase/supabase-js": "^2.x",
    "@tiptap/react": "^2.x",
    "@tiptap/starter-kit": "^2.x",
    "@tiptap/extension-underline": "^2.x",
    "@tiptap/extension-link": "^2.x",
    "@tiptap/extension-bullet-list": "^2.x",
    "@tiptap/extension-ordered-list": "^2.x",
    "@tiptap/extension-list-item": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^4.x",
    "@types/react": "^19.x",
    "@types/node": "^22.x"
  }
}
```

---

## Development Commands

```bash
# Start development server (Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

---

## Deployment (Vercel)

1. Push to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

---

## Troubleshooting

### Lists not showing bullets
Ensure `globals.css` has ProseMirror list overrides:
```css
.ProseMirror ul {
  list-style-type: disc !important;
  padding-left: 2rem !important;
}
```

### Ctrl+H not working for headings
Browser intercepts Ctrl+H for history. Use Alt+H instead.

### Auth session lost on refresh
Check that Supabase client is correctly initialized with `createBrowserClient`.

### Notes not appearing
Verify Row Level Security policies in Supabase.

---

## Code Conventions

1. **Component Structure**: Each component has JSDoc header explaining inputs/outputs
2. **File Organization**: Components in `ui/components/`, contexts in `ui/contexts/`
3. **Styling**: Tailwind utility classes, CSS variables for theming
4. **State Management**: React hooks (useState, useEffect), no external state library
5. **Type Safety**: TypeScript throughout, types in `types.ts`

---

## Contact

For questions about this project, refer to the documentation in `/docs` or review the codebase structure above.
