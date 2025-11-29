# LinkedIn AI Showcase Strategy

**Last Updated:** 2025-11-29
**Global Command:** `/linkedin` (available in all projects)

---

## Core Positioning

- **Not just** "architect learning AI" — **but** "architect building real tools while learning"
- **Differentiation:** hands-on work, not reshared articles or theory
- **Format:** "Here's what I built, here's what broke, here's what I learned"

---

## Project Portfolio

### Tier 1 — Foundation (Current)

| Project | Status | Stack | Notes |
|---------|--------|-------|-------|
| **NoteApp** | COMPLETE | Next.js 16, TypeScript, TipTap, Supabase, Tailwind | Rich text editor with templates, auth, themes |
| Workout Tracker | Not started | TBD | Simple app to record exercise benchmarks |

### Tier 2 — Intelligence Layer (Next)
- Add simple agents to Tier 1 apps
- Investment backtesting with multi-agent orchestration

### Tier 3 — Full Stack AI (Future)
- Skills + Agents + UI combined project
- BMAD framework implementation

---

## NoteApp Details (For Posts)

**Stack:**
- Frontend: Next.js 16.0.3 with Turbopack
- Language: TypeScript 5.x
- Styling: Tailwind CSS 4.x with CSS variable theming
- Editor: TipTap 2.x (ProseMirror-based)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth (email/password)

**Features Built:**
- Rich text editing (Bold, Italic, Underline, Headings)
- Bullet and numbered lists with proper nesting
- 6 templates (Weekend Planner, Goal Tracker, Lecture Notes, Meeting Notes, Daily Journal, Project Ideas)
- Auto-save with 1-second debounce
- Pin/unpin notes, search, soft delete
- Dark/light theme toggle
- Word count display
- Keyboard shortcuts modal

**Challenges Overcome:**
- Tailwind CSS reset conflicting with list bullets (fixed with custom CSS)
- Browser Ctrl+H shortcut conflict (changed to Alt+H)
- TipTap extension configuration for lists
- Template spacing and formatting

**Development Time:**
- Design & Planning: 4h (13%)
- Documentation: 3h (10%)
- Building: 15h (48%)
- Debugging: 6h (19%)
- Testing: 3h (10%)
- **Total: 31 hours**

---

## Posting Cadence

Weekly posts. First month calendar:

| Week | Theme | Project |
|------|-------|---------|
| 1 | "Shipped my first AI-era side project" | NoteApp |
| 2 | "Adding a simple AI agent to my note app" | NoteApp |
| 3 | "Starting a new build: workout tracker" | Workout App |
| 4 | "What I'm learning about AI agents" | Meta/Learning |

---

## Post Format

1. **Hook** — one line to stop scrolling
2. **Context** — what you built, why
3. **Interesting bit** — challenge, learning, counterintuitive finding
4. **Visual** — screenshot, video, or architecture diagram
5. **Call to reflection** — invite genuine response (not "like and follow")

---

## AI Feature Ideas for NoteApp (Post #2 Content)

**AI-Native Features:**
- Smart tagging (auto-categorize based on content)
- Related notes surfacing
- Quick summarize (collapse long note to key points)
- Voice note transcription with structure

**Workflow Features:**
- Meeting notes template with action item extraction
- Link to Jira/task tracking
- Daily standup generator from notes

---

## Post #1 Draft Outline

**Hook:** "I shipped my first AI-era side project this week."

**Context:**
- Built a note-taking app from scratch
- Used Claude Code as my pair programmer
- Next.js + TipTap + Supabase stack

**Interesting bit:**
- 48% of time was building, 19% was debugging
- Biggest challenge: CSS frameworks fighting each other
- AI helped most with: boilerplate, debugging, documentation

**Visual:** Screenshot of NoteApp with templates panel

**CTA:** "What's the first thing you'd build with an AI assistant?"

---

## How to Use

**From any project:** Type `/linkedin` to load this strategy

**Example prompts:**
- "Help me draft post #1"
- "What AI feature should I add for post #2?"
- "Review this LinkedIn post draft"
