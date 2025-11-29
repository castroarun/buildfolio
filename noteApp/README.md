# NoteApp - Clean & Simple Note-Taking

A fast, clean, and simple note-taking web application with rich text editing and templates. Built with Next.js 16, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Instant Note-Taking**: Start typing immediately upon app launch with a central editor focus
- **Rich Text Editing**: Full-featured Tiptap editor with formatting (bold, italic, underline), headings, and lists
- **Auto-Save**: Changes saved automatically after 1 second of inactivity
- **Supabase Authentication**: Secure signin with email/password
- **Templates System**: 6 pre-built templates (Weekend Planner, Goal Tracker, Lecture Notes, Meeting Notes, Daily Journal, Project Ideas)
- **Note Organization**: Pin important notes, search across all notes
- **Dark Mode**: Toggle between light and dark themes
- **Keyboard Shortcuts**: Full keyboard navigation support with help modal

## Tech Stack

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, TypeScript 5.x
- **Styling**: Tailwind CSS 4.x with CSS variable theming
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password)
- **Editor**: Tiptap 2.x (ProseMirror-based rich text editor)

## Project Structure

```
noteApp/
├── app/                      # Next.js app router
│   ├── page.tsx             # Main page with auth check
│   ├── layout.tsx           # Root layout
│   └── auth/callback/       # OAuth callback handler
├── ui/                      # UI components
│   ├── components/
│   │   ├── Auth.tsx        # Authentication components
│   │   ├── MainApp.tsx     # Main app container
│   │   ├── Editor.tsx      # Tiptap rich text editor
│   │   ├── NotesPanel.tsx  # Left sidebar - notes list
│   │   └── RightPanel.tsx  # Right sidebar - templates
│   └── styles/
│       └── globals.css     # Global styles with Tailwind
├── lib/                     # Business logic and utilities
│   ├── supabase.ts         # Server-side Supabase client
│   ├── supabase-client.ts  # Browser-side Supabase client
│   └── database.types.ts   # Database TypeScript types
├── types.ts                 # Application TypeScript types
└── docs/                    # Documentation
    ├── NOTE-APP-PRD.md     # Product requirements
    ├── BUILD-INSTRUCTIONS.md # Build guide
    └── TIME-SPENT.md       # Development time analysis
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd noteApp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `docs/DATABASE-SCHEMA.sql`
3. Get your Supabase credentials:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public

### 3. Configure Environment Variables

Create `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Notes

1. Sign in with email/password
2. Click "+ New Note" or start typing in the editor
3. Notes auto-save after 1 second of inactivity

### Formatting Text

Use the toolbar buttons or keyboard shortcuts:
- **Bold**: Ctrl+B
- **Italic**: Ctrl+I
- **Underline**: Ctrl+U
- **Heading**: Alt+H
- **Bullet List**: Ctrl+Shift+8
- **Numbered List**: Ctrl+Shift+7

### Using Templates

Click any template icon in the right panel to create a new note with that template:
- 📅 Weekend Planner
- 🎯 Goal Tracker
- 📚 Lecture Notes
- 📋 Meeting Notes
- 📝 Daily Journal
- 💡 Project Ideas

## Development

### Build for Production

```bash
npm run build
npm run start
```

### Type Checking

```bash
npx tsc --noEmit
```

## Row Level Security (RLS)

All database tables have Row Level Security enabled. Users can only:
- View their own notes
- Create/update/delete their own notes

## Future Enhancements (Not Implemented)

- Jira Integration
- Gmail Integration
- Markdown File Sync
- Tags System
- Note Sharing
- Real-time Collaboration

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- Editor by [Tiptap](https://tiptap.dev/)

---

**Last Updated**: 2025-11-29
**Version**: 1.0.0
