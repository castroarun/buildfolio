/**
 * API route to manage Jira configuration
 *
 * GET: Retrieve user's Jira configuration
 * POST: Save/update user's Jira configuration
 *
 * Called by: Settings page/component
 * Calls: lib/jira getJiraConfig, saveJiraConfig
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { getJiraConfig, saveJiraConfig } from '@/lib/jira'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Jira configuration
    const config = await getJiraConfig(user.id)

    if (!config) {
      return NextResponse.json({ config: null }, { status: 200 })
    }

    // Don't send encrypted token to client
    const { api_token_encrypted, ...safeConfig } = config

    return NextResponse.json({ config: safeConfig }, { status: 200 })
  } catch (error: any) {
    console.error('Error fetching Jira config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Jira configuration' },
      { status: 500 }
    )
  }
}

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
    const { domain, email, apiToken, defaultProject, defaultIssueType } = body

    if (!domain || !email || !apiToken) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, email, apiToken' },
        { status: 400 }
      )
    }

    // Save configuration
    const success = await saveJiraConfig(user.id, {
      domain,
      email,
      api_token_encrypted: apiToken, // Will be encrypted in saveJiraConfig
      default_project: defaultProject,
      default_issue_type: defaultIssueType || 'Task',
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save Jira configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Jira configuration saved successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error saving Jira config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save Jira configuration' },
      { status: 500 }
    )
  }
}
