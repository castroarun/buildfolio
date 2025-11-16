# NoteApp - Clean & Simple Note-Taking with Jira & Gmail Integration

A fast, clean, and simple note-taking web application with powerful Jira task creation and Gmail communication features. Built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Instant Note-Taking**: Start typing immediately upon app launch with a central editor focus
- **Rich Text Editing**: Full-featured Tiptap editor with formatting, lists, code blocks, and links
- **Auto-Save**: Changes saved automatically after 2 seconds of inactivity
- **Google OAuth Authentication**: Secure signin with your Google account
- **Inline Jira Integration**: Auto-detect Jira tasks from your notes and create issues with one click
- **Gmail Integration**: Email notes directly from the app
- **Markdown File Sync**: Import/export notes as markdown files with YAML frontmatter
- **Tags & Organization**: Tag notes and filter by tags
- **Note Sharing**: Share notes with view or edit permissions
- **Collapsible Panels**: Clean, distraction-free interface with collapsible sidebars
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth with Google OAuth
- **Editor**: Tiptap (ProseMirror-based rich text editor)
- **APIs**: Jira REST API v3, Gmail API

## Project Structure

```
noteApp/
├── app/                      # Next.js app router
│   ├── page.tsx             # Main page with auth check
│   ├── layout.tsx           # Root layout
│   ├── auth/callback/       # OAuth callback handler
│   └── api/                 # API routes
│       ├── jira/           # Jira integration endpoints
│       └── gmail/          # Gmail integration endpoints
├── ui/                      # UI components
│   ├── components/
│   │   ├── Auth.tsx        # Authentication components
│   │   ├── MainApp.tsx     # Main app container
│   │   ├── Editor.tsx      # Tiptap rich text editor
│   │   ├── NotesPanel.tsx  # Left sidebar - notes list
│   │   ├── ActionsPanel.tsx # Right sidebar - tags & actions
│   │   └── JiraDetectionPanel.tsx # Inline Jira task detection
│   └── styles/
│       └── globals.css     # Global styles with Tailwind
├── lib/                     # Business logic and utilities
│   ├── supabase.ts         # Supabase client configuration
│   ├── jira.ts            # Jira API integration
│   ├── gmail.ts           # Gmail API integration
│   ├── fileSync.ts        # Markdown file sync
│   └── database.types.ts  # Database TypeScript types
├── types.ts                 # Application TypeScript types
├── docs/                    # Documentation
│   ├── DESIGN.md           # Product design document
│   ├── TEST-PLAN.csv       # Test plan
│   ├── UI-PROTOTYPES.md    # UI mockups
│   └── DATABASE-SCHEMA.sql # Database schema
└── .claude/                # Claude Code project instructions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account
- A Jira account (for Jira integration)
- Google Cloud Console project (for Google OAuth and Gmail)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd noteApp
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `docs/DATABASE-SCHEMA.sql`
3. Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials (see step 3)
4. Get your Supabase credentials:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs:
   - Enable "Google+ API" (for authentication)
   - Enable "Gmail API" (for email integration)
4. Create OAuth 2.0 credentials:
   - Go to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)
     - Your Supabase callback URL (from step 2.3)
5. Note your Client ID and Client Secret

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth (for Gmail token refresh)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Configure Jira (Optional)

1. Get your Jira details:
   - Domain: `yourcompany.atlassian.net`
   - Email: Your Atlassian account email
   - API Token: Create at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Project Key: Your Jira project key (e.g., "PROJ")
   - Issue Type: Usually "Task", "Story", or "Bug"

2. In the app:
   - Click Settings in the right panel
   - Enter your Jira configuration
   - Save

### 7. Configure Gmail (Optional)

Gmail integration is automatic through Google OAuth. When you sign in with Google, the app requests Gmail permissions. To send emails:

1. Sign in with Google
2. Grant Gmail permissions when prompted
3. Use the "Email Note" button in the actions panel

## Usage

### Creating Notes

1. Sign in with Google
2. Start typing immediately in the central editor
3. Notes auto-save after 2 seconds
4. Click "+ New Note" in the left panel for a new note

### Formatting Text

Use the toolbar buttons or keyboard shortcuts:
- **Bold**: Ctrl+B
- **Italic**: Ctrl+I
- **Headings**: H1, H2 buttons
- **Lists**: Bullet or numbered list buttons
- **Code**: Code block button

### Creating Jira Tasks

Two methods:

**1. Explicit Keywords (Recommended):**
```
TASK: Fix authentication bug
DESC: Users unable to login with Google OAuth
AC: Must complete OAuth flow successfully
AC: Must redirect to dashboard after login
COMMENT: Check redirect URL configuration
```

**2. Smart Detection:**
```
Fix authentication bug

Users are unable to login when clicking the Google signin button.

Must complete OAuth flow successfully
Must redirect to dashboard after login
```

When a Jira task is detected, a green panel appears at the bottom. Click "Create in Jira" to create the issue.

### Emailing Notes

1. Select a note
2. Click "Email Note" in the right panel
3. Enter recipient email
4. Optionally attach as markdown file
5. Click Send

### Markdown Sync

1. Click "Sync with Folder" in settings
2. Select a local folder
3. All notes will be exported as `.md` files with YAML frontmatter
4. Edit files locally, and changes sync back to the app

## Development

### Build for Production

```bash
npm run build
npm run start
```

### Type Checking

TypeScript is configured in strict mode. Run type checking:

```bash
npx tsc --noEmit
```

### Database Types

To regenerate database types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts
```

## Security Notes

⚠️ **IMPORTANT**: The current token encryption in `lib/jira.ts` and `lib/gmail.ts` uses base64 encoding, which is **NOT SECURE** for production. Before deploying:

1. Implement proper encryption using a library like `crypto` or `@aws-crypto/client-node`
2. Store encryption keys in environment variables
3. Never commit encryption keys to version control

Example with Node crypto:

```typescript
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY! // 32 bytes
const IV_LENGTH = 16

function encryptToken(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

function decryptToken(text: string): string {
  const parts = text.split(':')
  const iv = Buffer.from(parts.shift()!, 'hex')
  const encrypted = Buffer.from(parts.join(':'), 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
```

## Row Level Security (RLS)

All database tables have Row Level Security enabled. Users can only:
- View their own notes and shared notes
- Create/update/delete their own notes
- Manage their own tags, configurations, and templates
- Share notes they own

## Contributing

This project was built as a learning exercise for full-stack development with Next.js, TypeScript, and Supabase. Feel free to fork and customize for your needs.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI with [Tailwind CSS](https://tailwindcss.com/)
- Database by [Supabase](https://supabase.com/)
- Editor by [Tiptap](https://tiptap.dev/)
- Icons from [Heroicons](https://heroicons.com/)

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
