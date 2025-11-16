'use client'

/**
 * Main application component with editor and collapsible panels
 *
 * Input: user object from Supabase auth
 * Output: Complete note-taking interface
 *
 * Called by: app/page.tsx when user is authenticated
 * Calls: Editor, NotesPanel, ActionsPanel, UserMenu
 */

import { useState } from 'react'
import { Editor } from './Editor'
import { NotesPanel } from './NotesPanel'
import { ActionsPanel } from './ActionsPanel'
import { UserMenu } from './Auth'
import type { PanelState } from '@/types'

interface MainAppProps {
  user: any
}

export function MainApp({ user }: MainAppProps) {
  const [panels, setPanels] = useState<PanelState>({
    left: true,
    right: true,
  })
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null)

  /**
   * Toggle panel visibility
   *
   * Input: panel name ('left' or 'right')
   * Output: Updates panel state
   *
   * Called by: Panel collapse buttons
   * Calls: setPanels
   */
  const togglePanel = (panel: 'left' | 'right') => {
    setPanels(prev => ({
      ...prev,
      [panel]: !prev[panel],
    }))
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Top header bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-light text-text-primary">NoteApp</h1>
        </div>
        <UserMenu user={user} />
      </header>

      {/* Main content area with 3 sections */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Notes List */}
        {panels.left && (
          <div className="w-[280px] bg-border-light border-r border-border flex flex-col">
            <NotesPanel
              onSelectNote={setCurrentNoteId}
              currentNoteId={currentNoteId}
              onClose={() => togglePanel('left')}
            />
          </div>
        )}

        {/* Center Panel - Editor (always visible, takes remaining space) */}
        <div className="flex-1 flex flex-col">
          {!panels.left && (
            <button
              onClick={() => togglePanel('left')}
              className="absolute top-16 left-2 p-2 bg-background border border-border rounded hover:bg-border-light transition-colors z-10"
              title="Show notes list"
            >
              <svg
                className="w-4 h-4 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          <Editor noteId={currentNoteId} userId={user.id} />

          {!panels.right && (
            <button
              onClick={() => togglePanel('right')}
              className="absolute top-16 right-2 p-2 bg-background border border-border rounded hover:bg-border-light transition-colors z-10"
              title="Show actions panel"
            >
              <svg
                className="w-4 h-4 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Right Panel - Tags & Actions */}
        {panels.right && (
          <div className="w-[280px] bg-border-light border-l border-border flex flex-col">
            <ActionsPanel
              noteId={currentNoteId}
              onClose={() => togglePanel('right')}
            />
          </div>
        )}
      </main>
    </div>
  )
}
