'use client'

/**
 * Actions panel component (right sidebar)
 *
 * Input: noteId (optional), onClose callback
 * Output: Tags, quick actions, and sync status
 *
 * Called by: MainApp component
 * Calls: Tag management, email, Jira actions
 */

import { useState } from 'react'

interface ActionsPanelProps {
  noteId: string | null
  onClose: () => void
}

export function ActionsPanel({ noteId, onClose }: ActionsPanelProps) {
  const [tags, setTags] = useState<string[]>([])

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-medium text-text-primary">Actions</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-border rounded transition-colors"
          title="Close panel"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Tags Section */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Tags</h3>
          {noteId ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-xs text-text-muted">No tags yet</p>
                ) : (
                  tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs rounded"
                    >
                      {tag}
                      <button className="hover:text-red-500">×</button>
                    </span>
                  ))
                )}
              </div>
              <input
                type="text"
                placeholder="Add tag..."
                className="w-full px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setTags([...tags, e.currentTarget.value])
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          ) : (
            <p className="text-xs text-text-muted">Select a note to add tags</p>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button
              disabled={!noteId}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border border-border rounded hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-text-primary">Create Jira Task</span>
            </button>

            <button
              disabled={!noteId}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border border-border rounded hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-text-primary">Email Note</span>
            </button>

            <button
              disabled={!noteId}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border border-border rounded hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-text-primary">Share Note</span>
            </button>

            <button
              disabled={!noteId}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left border border-border rounded hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-text-primary">Delete Note</span>
            </button>
          </div>
        </div>

        {/* Sync Status */}
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-3">Sync Status</h3>
          <div className="flex items-center gap-2 px-3 py-2 bg-border-light rounded">
            <svg className="w-4 h-4 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-text-secondary">All changes saved</span>
          </div>
        </div>

        {/* Settings Link */}
        <div className="pt-4 border-t border-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-border-light rounded transition-colors">
            <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-text-primary">Settings</span>
          </button>
        </div>
      </div>
    </>
  )
}
