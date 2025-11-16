'use client'

/**
 * Notes list panel component (left sidebar)
 *
 * Input: onSelectNote callback, currentNoteId, onClose callback
 * Output: List of notes with search and create functionality
 *
 * Called by: MainApp component
 * Calls: supabase.from('notes').select
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { Note } from '@/types'

interface NotesPanelProps {
  onSelectNote: (noteId: string) => void
  currentNoteId: string | null
  onClose: () => void
}

export function NotesPanel({ onSelectNote, currentNoteId, onClose }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  /**
   * Load notes from database
   */
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Create new note
   */
  const handleCreateNote = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: 'Untitled',
          content: '',
          plain_text: '',
        })
        .select()
        .single()

      if (error) throw error
      setNotes(prev => [data, ...prev])
      onSelectNote(data.id)
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.plain_text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-medium text-text-primary">Notes</h2>
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

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent-blue"
        />
      </div>

      {/* New Note Button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleCreateNote}
          className="w-full px-3 py-2 text-sm bg-accent-blue text-white rounded hover:bg-blue-600 transition-colors"
        >
          + New Note
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 text-sm text-text-muted text-center">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-4 text-sm text-text-muted text-center">
            {searchQuery ? 'No notes found' : 'No notes yet. Create one to get started!'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredNotes.map(note => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  currentNoteId === note.id
                    ? 'bg-accent-blue text-white'
                    : 'hover:bg-border-light text-text-primary'
                }`}
              >
                <div className="font-medium text-sm truncate">{note.title}</div>
                <div className={`text-xs truncate mt-1 ${
                  currentNoteId === note.id ? 'text-white/70' : 'text-text-muted'
                }`}>
                  {note.plain_text || 'Empty note'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
