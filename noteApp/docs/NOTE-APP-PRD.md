# Note App with Jira & Gmail Integration
## Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2025-11-16
**Status:** Planning Phase

---

## Plan Outline

### Core Vision
A **web-based note-taking application** that combines simple note management with powerful **Jira task creation** and **Gmail communication**, featuring **real-time markdown file synchronization** with local filesystem.

### Key Features (Bullet Points)
- ✍️ **Rich Text Editing** - Professional note-taking with advanced formatting
- 🔐 **Google Authentication** - Secure single sign-on
- 🏷️ **Tag-based Organization** - Categorize and find notes easily
- 📝 **Markdown File Sync** - Bidirectional sync with local `.md` files
- 🤝 **Note Sharing** - Collaborate with friends/colleagues
- 🎯 **Smart Jira Integration** - Auto-detect and create tasks from notes
- 📧 **Gmail Integration** - Email tasks and notes directly
- ☁️ **Cloud Storage** - Access notes anywhere, anytime
- 💾 **Auto-save** - Never lose your work
- 🔍 **Search & Filter** - Find notes instantly

### Technology Highlights
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS v3
- **Backend:** Next.js API routes, Supabase (PostgreSQL)
- **Editor:** Tiptap (ProseMirror-based rich text)
- **Auth:** Google OAuth via Supabase
- **APIs:** Jira REST API v3, Gmail API

### Target Timeline
**15 weeks** from setup to production deployment

---

## Feature Specifications

### 1. Note Management (Core Functionality)

#### Overview
The foundation of the application - a robust note-taking system with modern rich text editing capabilities.

#### User Stories
- As a user, I want to create notes quickly with a clean interface
- As a user, I want rich formatting options (headings, bold, italic, lists, code blocks)
- As a user, I want my notes to auto-save so I never lose work
- As a user, I want to organize notes with tags
- As a user, I want to search across all my notes instantly

#### Functional Requirements
1. **Create Note**
   - Click "New Note" button
   - Start typing immediately
   - Auto-save every 2 seconds (debounced)
   - Default title from first line or "Untitled Note"

2. **Edit Note**
   - Rich text editor with toolbar
   - Formatting: headings (H1-H6), bold, italic, underline, strikethrough
   - Lists: bullet, numbered, checklist
   - Code blocks with syntax highlighting
   - Links and images
   - Keyboard shortcuts (Ctrl+B for bold, etc.)

3. **Delete Note**
   - Soft delete (move to trash)
   - Restore from trash within 30 days
   - Permanent delete after 30 days

4. **Tag System**
   - Add multiple tags per note
   - Create new tags on-the-fly
   - Color-coded tags
   - Filter notes by tags
   - Tag autocomplete

5. **Search**
   - Full-text search across all notes
   - Search by title, content, tags
   - Real-time search results
   - Highlight matched terms

#### Technical Notes
- Content stored as **Tiptap JSON** format (structured, queryable)
- Also store **Markdown representation** for export/sync
- Use **PostgreSQL full-text search** for performance
- **Version history** - keep last 10 versions of each note

---

### 2. Google Authentication

#### Overview
Secure, passwordless authentication using Google accounts.

#### User Flow
1. User lands on homepage
2. Sees "Sign in with Google" button
3. Clicks → Redirected to Google OAuth consent screen
4. Grants permission → Redirected back to app
5. Logged in → Sees their notes dashboard

#### Functional Requirements
- Google OAuth 2.0 integration
- Session persistence (remember me)
- Logout functionality
- User profile display (name, email, avatar)
- First-time user onboarding (welcome message, quick tour)

#### Security
- httpOnly cookies for session tokens
- CSRF protection
- Token refresh mechanism
- Secure redirect URLs

---

### 3. Markdown File Synchronization

#### Overview
Seamlessly sync notes with local `.md` files on user's computer for offline access and use with other tools.

#### User Stories
- As a user, I want to edit notes in my favorite text editor (VS Code, Sublime)
- As a user, I want changes in local files to appear in the app automatically
- As a user, I want changes in the app to update local files
- As a user, I want to version control my notes with Git

#### Functional Requirements
1. **Folder Selection**
   - User clicks "Sync with Folder"
   - File picker opens (File System Access API)
   - User selects folder
   - App requests persistent permission

2. **Initial Import**
   - Read all `.md` files from selected folder
   - Parse markdown → Convert to Tiptap JSON
   - Create notes in database
   - Link note to file path

3. **Bidirectional Sync**
   - **Local → Cloud:** Detect file changes (file watcher) → Update database
   - **Cloud → Local:** Detect note changes in app → Write to file
   - Sync triggers within 1 second of change

4. **Conflict Resolution**
   - Last-write-wins strategy (for MVP)
   - Show notification when conflict occurs
   - Future: Merge strategy or user choice

5. **Sync Status**
   - Visual indicator: synced ✓, syncing ⟳, conflict ⚠️
   - Sync log/history

#### Technical Notes
- **File System Access API** (Chrome, Edge - requires HTTPS)
- **Fallback:** Download/upload .md files manually for unsupported browsers
- **Watcher:** Use `FileSystemFileHandle.getFile()` polling or watch folder
- **Format:** Standard markdown with YAML frontmatter for metadata (tags, created date)

**Example .md file:**
```markdown
---
title: My Note Title
tags: [work, important]
created: 2025-11-16T10:30:00Z
---

# My Note Title

Content goes here with **formatting**.
```

---

### 4. Note Sharing & Collaboration

#### Overview
Share notes with others via email invitation, with view or edit permissions.

#### User Stories
- As a user, I want to share a note with a colleague via their email
- As a user, I want to control if they can edit or just view
- As a user, I want to see who I've shared notes with
- As a collaborator, I want to see changes in real-time

#### Functional Requirements
1. **Share Note**
   - Click "Share" button on note
   - Enter email address(es)
   - Select permission: View or Edit
   - Send invitation

2. **Email Invitation**
   - Recipient receives email with link
   - Click link → Prompted to sign in with Google
   - After login → Sees shared note

3. **Permissions**
   - **View:** Can read note, cannot edit
   - **Edit:** Can modify note content, add tags
   - **Owner:** Original creator, can delete, change permissions

4. **Real-time Collaboration**
   - Multiple users editing same note
   - See other users' cursors
   - Changes appear live (via Supabase Realtime)
   - Show who's currently viewing (presence)

5. **Manage Sharing**
   - View list of people with access
   - Revoke access
   - Change permissions
   - Stop sharing (remove all access)

#### Technical Notes
- Use **Supabase Realtime** for live collaboration
- **Row-level security** - users can only access their own notes or shared notes
- Email via **Gmail API** or **Supabase Edge Functions** with SendGrid

---

### 5. Smart Jira Integration

#### Overview
Revolutionary hybrid parsing system that intelligently detects task structure in notes and creates/updates Jira issues.

#### User Stories
- As a user, I want to write notes naturally and have tasks auto-detected
- As a user, I want to explicitly mark sections as TASK, DESC, AC when needed
- As a user, I want to create Jira issues directly from notes with one click
- As a user, I want to update Jira issues when I edit notes

#### Hybrid Parsing System

**Mode 1: Explicit Keywords (Structured)**
```
TASK: Implement user authentication
DESC: Add Google OAuth login to the application
AC: Users can sign in with Google account
AC: Session persists across browser restarts
AC: Logout button works correctly
COMMENT: Check OAuth redirect URI configuration in Google Console
```

**Mode 2: Smart Detection (Natural Writing)**
```
Fix the authentication bug                    ← Detected: TASK (keyword "Fix")
Users are unable to login with Google OAuth   ← Detected: DESC (follows task)
Must complete OAuth flow successfully         ← Detected: AC (keyword "Must")
Must redirect to dashboard after login        ← Detected: AC (keyword "Must")
Check redirect URI configuration              ← Detected: COMMENT (standalone)
```

**Detection Rules:**
- **TASK keywords:** fix, add, update, create, implement, build, refactor, remove, delete
- **AC keywords:** must, should, verify, ensure, check that, needs to
- **COMMENT keywords:** note:, todo:, fixme:, check, investigate
- **DESC:** Content immediately following task (if not explicit)

#### Functional Requirements

1. **Parse Note for Task**
   - User writes note with task information
   - Click "Create Jira Task" button
   - App parses content using hybrid system
   - Shows preview of detected task structure
   - User confirms or edits before creating

2. **Create Jira Issue**
   - Sends parsed data to Jira API
   - Creates issue in configured project
   - Links Jira issue to note (stores issue key)
   - Shows success notification with link to Jira

3. **Update Jira Issue**
   - User edits note content
   - Click "Update Jira Task"
   - App detects changes
   - Updates corresponding Jira issue
   - Syncs status back to note

4. **Jira Configuration**
   - User enters Jira domain (e.g., company.atlassian.net)
   - Provides email and API token
   - Selects default project
   - Selects default issue type (Task, Story, Bug)
   - Credentials stored encrypted

5. **Multiple Jira Projects**
   - Support multiple Jira accounts/projects
   - Select project per note or per task
   - Switch between projects easily

#### Parsing Algorithm (High-Level)
```
1. Split note content into paragraphs
2. Initialize: taskData = {}
3. For each paragraph:
   a. Check if starts with explicit keyword (TASK:, DESC:, AC:, COMMENT:)
   b. If yes → Use explicit type
   c. If no → Check first word against detection patterns
   d. Assign to appropriate section
4. Validate: Must have at least TASK
5. Return structured taskData object
```

#### Example Output
```javascript
{
  task: "Implement user authentication",
  description: "Add Google OAuth login to the application",
  acceptanceCriteria: [
    "Users can sign in with Google account",
    "Session persists across browser restarts",
    "Logout button works correctly"
  ],
  comment: "Check OAuth redirect URI configuration in Google Console"
}
```

---

### 6. Gmail Integration

#### Overview
Send notes and tasks via email directly from the application.

#### User Stories
- As a user, I want to email a note to someone
- As a user, I want to email a Jira task summary to my team
- As a user, I want to attach the note as a `.md` file
- As a user, I want to use email templates for common scenarios

#### Functional Requirements

1. **Email Note**
   - Click "Email" button on note
   - Enter recipient email(s)
   - Optional: Add subject (default: note title)
   - Optional: Add message body
   - Choose: Include as inline HTML or attach as .md file
   - Send

2. **Email Jira Task**
   - After creating Jira task from note
   - Option to "Email task summary"
   - Pre-filled template with task details
   - Send to team members

3. **Templates**
   - Save email templates for reuse
   - Variables: {{noteTitle}}, {{taskSummary}}, {{jiraLink}}
   - Quick select template

4. **Gmail Configuration**
   - One-time OAuth with Gmail API
   - Grant "Send email" permission
   - Stored securely

#### Email Format (Example)
```
Subject: [Note] Fix authentication bug

Hi,

I wanted to share this note with you:

---
Fix authentication bug
Users are unable to login with Google OAuth
Must complete OAuth flow successfully
---

Related Jira Task: PROJ-123
https://company.atlassian.net/browse/PROJ-123

Best regards,
[User Name]
```

---

## Integration Strategy

### Overview
The application integrates with two external platforms: **Jira** (for task management) and **Gmail** (for email communication). Both integrations use official REST APIs with OAuth 2.0 authentication.

---

### Jira Integration Details

#### API: Jira REST API v3
**Documentation:** https://developer.atlassian.com/cloud/jira/platform/rest/v3/

#### Authentication Method
- **Basic Auth** over HTTPS
- User provides: Email + API Token
- API Token generated from: https://id.atlassian.com/manage-profile/security/api-tokens

#### Configuration Storage
```javascript
{
  domain: "yourcompany.atlassian.net",
  email: "user@company.com",
  apiToken: "encrypted_token_here", // Encrypted at rest
  defaultProjectKey: "PROJ",
  defaultIssueType: "Task"
}
```

#### Key API Endpoints Used

**1. Create Issue**
```
POST https://{domain}/rest/api/3/issue

Headers:
  Authorization: Basic {base64(email:apiToken)}
  Content-Type: application/json

Body:
{
  "fields": {
    "project": { "key": "PROJ" },
    "summary": "Task title",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [...]  // Jira Document Format
    },
    "issuetype": { "name": "Task" }
  }
}

Response:
{
  "id": "10000",
  "key": "PROJ-123",
  "self": "https://yourcompany.atlassian.net/rest/api/3/issue/10000"
}
```

**2. Update Issue**
```
PUT https://{domain}/rest/api/3/issue/{issueKey}

Body:
{
  "fields": {
    "summary": "Updated title",
    "description": {...}
  }
}
```

**3. Get Issue**
```
GET https://{domain}/rest/api/3/issue/{issueKey}

Response: Full issue details
```

**4. Add Comment**
```
POST https://{domain}/rest/api/3/issue/{issueKey}/comment

Body:
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [...]
  }
}
```

#### Description Format
Jira uses **Atlassian Document Format (ADF)**, a JSON structure similar to ProseMirror.

**Example:**
```json
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Users are unable to login" }
      ]
    },
    {
      "type": "heading",
      "attrs": { "level": 3 },
      "content": [
        { "type": "text", "text": "Acceptance Criteria" }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                { "type": "text", "text": "OAuth flow completes" }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### Integration Flow

```
User writes note → Clicks "Create Jira Task"
    ↓
App parses note content (hybrid parser)
    ↓
Converts to Jira ADF format
    ↓
Calls Jira API (POST /issue)
    ↓
Receives issue key (e.g., PROJ-123)
    ↓
Stores link in database (jira_links table)
    ↓
Shows success + link to Jira
```

#### Error Handling
- **Invalid credentials:** Show error, prompt re-configuration
- **Project not found:** Ask user to verify project key
- **Rate limiting:** Exponential backoff, retry
- **Network errors:** Cache request, retry when online

#### Security Considerations
- API tokens stored **encrypted** in database
- Never expose in client-side code
- API calls made from **server-side** (Next.js API routes)
- Validate user owns the note before creating Jira issue

---

### Gmail Integration Details

#### API: Gmail API v1
**Documentation:** https://developers.google.com/gmail/api

#### Authentication Method
- **OAuth 2.0** (Google)
- User grants permission: "Send emails on your behalf"
- Scopes: `https://www.googleapis.com/auth/gmail.send`

#### OAuth Flow

```
User clicks "Connect Gmail"
    ↓
App redirects to Google OAuth consent screen
    ↓
User grants permission
    ↓
Google redirects back with authorization code
    ↓
App exchanges code for access token + refresh token
    ↓
Tokens stored encrypted in database
    ↓
App can send emails on behalf of user
```

#### Configuration Storage
```javascript
{
  accessToken: "encrypted_access_token",
  refreshToken: "encrypted_refresh_token",
  expiresAt: "2025-11-16T15:00:00Z",
  email: "user@gmail.com"
}
```

#### Key API Endpoint Used

**Send Email**
```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send

Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json

Body:
{
  "raw": "base64url_encoded_email_message"
}

Response:
{
  "id": "18c1a2b3d4e5f6g7",
  "threadId": "18c1a2b3d4e5f6g7",
  "labelIds": ["SENT"]
}
```

#### Email Message Format (RFC 2822)
```
From: user@gmail.com
To: recipient@example.com
Subject: Note: Fix authentication bug
Content-Type: text/html; charset=utf-8

<html>
  <body>
    <h2>Fix authentication bug</h2>
    <p>Users are unable to login with Google OAuth</p>
    <h3>Related Jira Task</h3>
    <p><a href="https://company.atlassian.net/browse/PROJ-123">PROJ-123</a></p>
  </body>
</html>
```

**Encoding:**
1. Construct email as string (with headers + body)
2. Base64url encode (RFC 4648)
3. Send in `raw` field

#### Integration Flow

```
User clicks "Email Note"
    ↓
App shows email compose dialog
    ↓
User enters recipient, subject, message
    ↓
App converts note to HTML
    ↓
Constructs RFC 2822 email message
    ↓
Base64url encodes message
    ↓
Calls Gmail API (POST /messages/send)
    ↓
Shows success notification
```

#### Attachments (Future Enhancement)
**Send .md file as attachment:**
```
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/html; charset=utf-8

<html><body>Email body</body></html>

--boundary123
Content-Type: text/markdown; name="note.md"
Content-Disposition: attachment; filename="note.md"
Content-Transfer-Encoding: base64

<base64_encoded_markdown_file>

--boundary123--
```

#### Error Handling
- **Token expired:** Automatically refresh using refresh token
- **Invalid recipient:** Validate email format before sending
- **Rate limiting:** Gmail has generous limits, but handle gracefully
- **Permission revoked:** Detect and prompt user to re-authorize

#### Security Considerations
- Tokens stored **encrypted** in database
- API calls from **server-side only**
- Validate user owns the note before emailing
- Prevent spam: Rate limit per user (e.g., 50 emails/hour)

---

### Integration Architecture

Both integrations follow similar pattern:

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js Frontend                    │
│  - User clicks "Create Jira Task" or "Email Note"      │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ↓ API Request
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (Server-side)           │
│  - /api/jira/create                                     │
│  - /api/gmail/send                                      │
│                                                          │
│  → Fetch encrypted credentials from Supabase            │
│  → Decrypt credentials                                  │
│  → Call external API (Jira/Gmail)                       │
│  → Return result to frontend                            │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ↓                   ↓
┌──────────────┐    ┌──────────────┐
│   Jira API   │    │  Gmail API   │
│ (Atlassian)  │    │  (Google)    │
└──────────────┘    └──────────────┘
```

**Why server-side?**
- Keep API tokens secure (never exposed to browser)
- Prevent CORS issues
- Enable server-side validation
- Rate limiting and logging

---

## Development Plan

### Phase 1: Foundation (Weeks 1-3)
**Goal:** Get basic app running with authentication and simple notes

**Tasks:**
- Initialize Next.js project with TypeScript
- Configure Tailwind CSS v3
- Set up Supabase project
- Create database schema (notes, users, tags tables)
- Implement Google OAuth login
- Build basic note CRUD (without rich editor)
- Create simple UI (note list, create/edit/delete)

**Deliverable:** Working app where users can log in and create plain text notes

---

### Phase 2: Rich Text Editor (Weeks 4-5)
**Goal:** Upgrade to professional rich text editing

**Tasks:**
- Integrate Tiptap editor
- Build formatting toolbar
- Implement keyboard shortcuts
- Add auto-save (debounced)
- Note versioning system

**Deliverable:** Full-featured note editor with formatting

---

### Phase 3: Tags & Organization (Week 6)
**Goal:** Help users organize notes

**Tasks:**
- Tag creation and management
- Tag autocomplete
- Filter notes by tags
- Search functionality (full-text)
- UI polish

**Deliverable:** Organized note management system

---

### Phase 4: Markdown File Sync (Weeks 7-8)
**Goal:** Sync notes with local filesystem

**Tasks:**
- Implement File System Access API integration
- Markdown ↔ Tiptap JSON conversion
- File watcher for bidirectional sync
- Conflict resolution (last-write-wins)
- Sync status indicators
- Fallback for unsupported browsers

**Deliverable:** Notes sync with local .md files in real-time

---

### Phase 5: Sharing (Week 9)
**Goal:** Enable collaboration

**Tasks:**
- Share note UI
- Email invitation system
- Permission management (view/edit)
- Supabase Realtime integration
- Real-time collaboration (cursors, presence)

**Deliverable:** Users can share and collaborate on notes

---

### Phase 6: Jira Integration (Weeks 10-11)
**Goal:** Create Jira tasks from notes

**Tasks:**
- Build hybrid paragraph parser
- Jira API client
- Jira configuration UI
- Create issue functionality
- Update issue functionality
- Link notes to Jira issues
- Convert content to Jira ADF format

**Deliverable:** Full Jira integration with smart parsing

**LinkedIn Post #3:** Technical deep dive on hybrid parsing system

---

### Phase 7: Gmail Integration (Week 12)
**Goal:** Email notes and tasks

**Tasks:**
- Gmail OAuth flow
- Email composition UI
- Send email via Gmail API
- Email templates
- Attach notes as .md files

**Deliverable:** Users can email notes directly from app

---

### Phase 8: Polish & Testing (Weeks 13-14)
**Goal:** Production-ready quality

**Tasks:**
- Unit tests (Vitest)
- Component tests (React Testing Library)
- E2E tests (Playwright)
- Performance optimization
- Accessibility improvements (a11y)
- Error handling refinement
- Security audit
- UI/UX polish

**Deliverable:** Robust, tested application

---

### Phase 9: Deployment (Week 15)
**Goal:** Launch to production

**Tasks:**
- Production environment setup
- Deploy to Vercel
- Configure custom domain
- Set up monitoring (Sentry, Analytics)
- Create user documentation
- Prepare demo for LinkedIn

**Deliverable:** Live application accessible to users

**LinkedIn Post #4:** Full journey recap, demo, lessons learned

---

## Success Metrics

### Technical Metrics
- **Performance:** Page load < 2 seconds
- **Reliability:** 99.9% uptime
- **Security:** Zero security vulnerabilities
- **Test Coverage:** > 80%

### User Metrics
- **Ease of Use:** Users can create first note within 30 seconds
- **Sync Performance:** File changes sync within 1 second
- **Integration Success:** > 90% success rate for Jira/Gmail API calls

### Learning Goals
- Master Next.js, React, TypeScript
- Understand full-stack development
- Learn external API integration
- Build production-ready application
- Create compelling LinkedIn content

---

## Risks & Mitigations

### Technical Risks

**Risk:** File System Access API not supported in all browsers
**Mitigation:** Provide fallback (manual download/upload), detect browser capability

**Risk:** Jira/Gmail API rate limiting
**Mitigation:** Implement exponential backoff, queue requests, show user limits

**Risk:** Real-time collaboration conflicts
**Mitigation:** Start with last-write-wins, add operational transform later

**Risk:** Tiptap ↔ Markdown conversion loses formatting
**Mitigation:** Test thoroughly, document limitations, use Tiptap markdown extension

### Schedule Risks

**Risk:** 15 weeks too ambitious for all features
**Mitigation:** Prioritize ruthlessly, cut features if needed (Gmail can be post-MVP)

**Risk:** External API integration takes longer than expected
**Mitigation:** Allocate buffer time, start with simpler features first

---

## Future Enhancements (Post-MVP)

- Mobile app (React Native)
- Browser extension
- Offline mode (PWA)
- AI-powered note summarization
- Voice notes
- Drawing/sketching
- Slack integration
- Notion import/export
- Multiple workspaces
- Team features (organizations)

---

## Appendix

### Glossary
- **ADF:** Atlassian Document Format - JSON structure for Jira content
- **Tiptap:** ProseMirror-based rich text editor
- **RLS:** Row Level Security (Supabase database security)
- **PRD:** Product Requirements Document

### References
- [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Gmail API](https://developers.google.com/gmail/api)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)
- [Tiptap Documentation](https://tiptap.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

**End of PRD**
