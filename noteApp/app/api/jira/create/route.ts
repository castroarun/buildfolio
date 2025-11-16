/**
 * API route to create Jira issue from note
 *
 * Input: POST request with noteId and task data
 * Output: Created Jira issue object
 *
 * Called by: JiraDetectionPanel component
 * Calls: lib/jira createJiraIssue, getJiraConfig
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { createJiraIssue, getJiraConfig } from '@/lib/jira'
import type { JiraTask } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { noteId, task }: { noteId: string; task: JiraTask } = body

    if (!task || !task.summary) {
      return NextResponse.json(
        { error: 'Invalid task data' },
        { status: 400 }
      )
    }

    // Get Jira configuration
    const jiraConfig = await getJiraConfig(user.id)

    if (!jiraConfig) {
      return NextResponse.json(
        { error: 'Jira not configured. Please configure Jira in settings.' },
        { status: 400 }
      )
    }

    // Create Jira issue
    const issue = await createJiraIssue(jiraConfig, {
      project: jiraConfig.default_project || '',
      issueType: jiraConfig.default_issue_type || 'Task',
      summary: task.summary,
      description: task.description,
      acceptanceCriteria: task.acceptanceCriteria,
    })

    // Update note with Jira issue key
    if (noteId) {
      await supabase
        .from('notes')
        .update({ jira_issue_key: issue.key })
        .eq('id', noteId)
    }

    return NextResponse.json({ issue }, { status: 200 })
  } catch (error: any) {
    console.error('Error creating Jira issue:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Jira issue' },
      { status: 500 }
    )
  }
}
