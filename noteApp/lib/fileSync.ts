/**
 * Markdown file synchronization library
 *
 * Handles importing/exporting notes as markdown files
 * with YAML frontmatter for metadata
 */

import type { Note, MarkdownFile, YAMLFrontmatter } from '@/types'

/**
 * Convert note to markdown file with YAML frontmatter
 *
 * Input: Note object
 * Output: Markdown file content string
 *
 * Called by: Export/sync functions
 * Calls: None
 */
export function noteToMarkdown(note: Note): string {
  const lines: string[] = []

  // Add YAML frontmatter
  lines.push('---')
  lines.push(`title: ${note.title}`)
  lines.push(`created: ${note.created_at}`)
  lines.push(`updated: ${note.updated_at}`)

  if (note.tags && note.tags.length > 0) {
    lines.push(`tags:`)
    note.tags.forEach(tag => {
      lines.push(`  - ${tag.name}`)
    })
  }

  if (note.jira_issue_key) {
    lines.push(`jira: ${note.jira_issue_key}`)
  }

  lines.push('---')
  lines.push('')

  // Add content (convert HTML to markdown if needed)
  lines.push(htmlToMarkdown(note.content))

  return lines.join('\n')
}

/**
 * Parse markdown file to note object
 *
 * Input: Markdown file content string
 * Output: Partial note object with frontmatter data
 *
 * Called by: Import/sync functions
 * Calls: parseFrontmatter
 */
export function markdownToNote(content: string): Partial<Note> {
  const { frontmatter, body } = parseFrontmatter(content)

  return {
    title: frontmatter.title || 'Untitled',
    content: markdownToHtml(body),
    plain_text: body,
    jira_issue_key: frontmatter.jira,
    // Note: tags would need to be resolved from tag names to IDs
  }
}

/**
 * Parse YAML frontmatter from markdown
 *
 * Input: Markdown content with frontmatter
 * Output: Frontmatter object and body content
 *
 * Called by: markdownToNote
 * Calls: None
 */
function parseFrontmatter(content: string): {
  frontmatter: YAMLFrontmatter
  body: string
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    return {
      frontmatter: {},
      body: content,
    }
  }

  const frontmatterText = match[1]
  const body = match[2]

  // Simple YAML parsing (for production, use a proper YAML library)
  const frontmatter: YAMLFrontmatter = {}
  const lines = frontmatterText.split('\n')
  let currentKey: string | null = null

  for (const line of lines) {
    const keyValue = line.match(/^(\w+):\s*(.*)$/)
    if (keyValue) {
      const [, key, value] = keyValue
      frontmatter[key] = value
      currentKey = key
    } else if (line.trim().startsWith('-') && currentKey === 'tags') {
      const tag = line.trim().substring(1).trim()
      if (!frontmatter.tags) frontmatter.tags = []
      if (Array.isArray(frontmatter.tags)) {
        frontmatter.tags.push(tag)
      }
    }
  }

  return { frontmatter, body }
}

/**
 * Convert HTML to Markdown
 *
 * Input: HTML string
 * Output: Markdown string
 *
 * Called by: noteToMarkdown
 * Calls: None
 */
function htmlToMarkdown(html: string): string {
  // Basic HTML to Markdown conversion
  // For production, use a library like turndown
  let markdown = html

  // Remove HTML tags for now (simplified)
  markdown = markdown.replace(/<p>/g, '\n')
  markdown = markdown.replace(/<\/p>/g, '\n')
  markdown = markdown.replace(/<br\s*\/?>/g, '\n')
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**')
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*')
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`')
  markdown = markdown.replace(/<[^>]*>/g, '') // Remove remaining tags
  markdown = markdown.trim()

  return markdown
}

/**
 * Convert Markdown to HTML
 *
 * Input: Markdown string
 * Output: HTML string
 *
 * Called by: markdownToNote
 * Calls: None
 */
function markdownToHtml(markdown: string): string {
  // Basic Markdown to HTML conversion
  // For production, use a library like marked or remark
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Code
  html = html.replace(/`(.*?)`/g, '<code>$1</code>')

  // Line breaks
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph
  html = `<p>${html}</p>`

  return html
}

/**
 * File System Access API helper for browser
 *
 * Note: This API only works in modern browsers and requires user permission
 *
 * Input: None
 * Output: Directory handle
 *
 * Called by: Client-side sync component
 * Calls: window.showDirectoryPicker
 */
export async function selectFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API not supported in this browser')
  }

  try {
    const dirHandle = await (window as any).showDirectoryPicker()
    return dirHandle
  } catch (error) {
    console.error('Error selecting folder:', error)
    return null
  }
}

/**
 * Read all markdown files from directory
 *
 * Input: Directory handle
 * Output: Array of markdown files
 *
 * Called by: Import sync function
 * Calls: File System Access API
 */
export async function readMarkdownFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<MarkdownFile[]> {
  const files: MarkdownFile[] = []

  for await (const entry of (dirHandle as any).values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      const file = await entry.getFile()
      const content = await file.text()

      files.push({
        path: dirHandle.name,
        filename: entry.name,
        content,
        frontmatter: parseFrontmatter(content).frontmatter,
        lastModified: new Date(file.lastModified).toISOString(),
      })
    }
  }

  return files
}

/**
 * Write note as markdown file to directory
 *
 * Input: Directory handle, note object, filename
 * Output: Success boolean
 *
 * Called by: Export/sync function
 * Calls: File System Access API
 */
export async function writeMarkdownFile(
  dirHandle: FileSystemDirectoryHandle,
  note: Note,
  filename?: string
): Promise<boolean> {
  try {
    const mdContent = noteToMarkdown(note)
    const name = filename || `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`

    const fileHandle = await (dirHandle as any).getFileHandle(name, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(mdContent)
    await writable.close()

    return true
  } catch (error) {
    console.error('Error writing markdown file:', error)
    return false
  }
}
