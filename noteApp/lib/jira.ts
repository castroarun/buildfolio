/**
 * Jira API integration library
 *
 * Handles all Jira REST API v3 interactions including
 * issue creation, updates, and configuration management
 */

import type { JiraConfig, JiraTask, JiraIssue, JiraCreateRequest } from '@/types'
import { createServerComponentClient } from './supabase'

/**
 * Get Jira configuration for current user
 *
 * Input: userId
 * Output: JiraConfig or null
 *
 * Called by: API routes
 * Calls: supabase.from('jira_configs').select
 */
export async function getJiraConfig(userId: string): Promise<JiraConfig | null> {
  const supabase = await createServerComponentClient()

  const { data, error } = await supabase
    .from('jira_configs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return data as JiraConfig
}

/**
 * Save or update Jira configuration
 *
 * Input: userId, config data
 * Output: Success boolean
 *
 * Called by: Settings API route
 * Calls: supabase.from('jira_configs').upsert, encryptToken
 */
export async function saveJiraConfig(
  userId: string,
  config: Omit<JiraConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const supabase = await createServerComponentClient()

  // Encrypt API token before storing
  const encryptedToken = encryptToken(config.api_token_encrypted)

  const { error } = await supabase.from('jira_configs').upsert({
    user_id: userId,
    domain: config.domain,
    email: config.email,
    api_token_encrypted: encryptedToken,
    default_project: config.default_project,
    default_issue_type: config.default_issue_type,
  })

  return !error
}

/**
 * Create Jira issue using REST API v3
 *
 * Input: config, request payload
 * Output: Created Jira issue object
 *
 * Called by: /api/jira/create route
 * Calls: Jira REST API v3, decryptToken
 */
export async function createJiraIssue(
  config: JiraConfig,
  request: JiraCreateRequest
): Promise<JiraIssue> {
  const apiToken = decryptToken(config.api_token_encrypted)
  const authHeader = Buffer.from(`${config.email}:${apiToken}`).toString('base64')

  // Build description with Acceptance Criteria in Atlassian Document Format (ADF)
  const description = buildADFDescription(
    request.description,
    request.acceptanceCriteria || []
  )

  const jiraPayload = {
    fields: {
      project: {
        key: request.project || config.default_project,
      },
      issuetype: {
        name: request.issueType || config.default_issue_type || 'Task',
      },
      summary: request.summary,
      description,
    },
  }

  const response = await fetch(
    `https://${config.domain}/rest/api/3/issue`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(jiraPayload),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.errorMessages?.join(', ') || 'Failed to create Jira issue')
  }

  const data = await response.json()

  return {
    id: data.id,
    key: data.key,
    summary: request.summary,
    description: request.description,
    status: 'Open',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    url: `https://${config.domain}/browse/${data.key}`,
  }
}

/**
 * Update existing Jira issue
 *
 * Input: config, issue key, updated fields
 * Output: Success boolean
 *
 * Called by: /api/jira/update route
 * Calls: Jira REST API v3
 */
export async function updateJiraIssue(
  config: JiraConfig,
  issueKey: string,
  updates: {
    summary?: string
    description?: string
    acceptanceCriteria?: string[]
  }
): Promise<boolean> {
  const apiToken = decryptToken(config.api_token_encrypted)
  const authHeader = Buffer.from(`${config.email}:${apiToken}`).toString('base64')

  const fields: any = {}

  if (updates.summary) {
    fields.summary = updates.summary
  }

  if (updates.description || updates.acceptanceCriteria) {
    fields.description = buildADFDescription(
      updates.description || '',
      updates.acceptanceCriteria || []
    )
  }

  const response = await fetch(
    `https://${config.domain}/rest/api/3/issue/${issueKey}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  return response.ok
}

/**
 * Build Atlassian Document Format (ADF) for description
 *
 * Input: description text, acceptance criteria array
 * Output: ADF JSON object
 *
 * Called by: createJiraIssue, updateJiraIssue
 * Calls: None
 */
function buildADFDescription(description: string, acceptanceCriteria: string[]) {
  const content: any[] = []

  // Add description paragraphs
  if (description) {
    const paragraphs = description.split('\n').filter(p => p.trim())
    paragraphs.forEach(para => {
      content.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: para,
          },
        ],
      })
    })
  }

  // Add acceptance criteria section
  if (acceptanceCriteria.length > 0) {
    content.push({
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: 'Acceptance Criteria',
        },
      ],
    })

    content.push({
      type: 'bulletList',
      content: acceptanceCriteria.map(ac => ({
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: ac,
              },
            ],
          },
        ],
      })),
    })
  }

  return {
    version: 1,
    type: 'doc',
    content,
  }
}

/**
 * Encrypt API token for storage
 *
 * Input: Plain text token
 * Output: Encrypted token
 *
 * Called by: saveJiraConfig
 * Calls: Node crypto (simplified - use proper encryption in production)
 */
function encryptToken(token: string): string {
  // TODO: Implement proper encryption with a secret key
  // For now, return base64 encoded (NOT SECURE FOR PRODUCTION)
  return Buffer.from(token).toString('base64')
}

/**
 * Decrypt API token from storage
 *
 * Input: Encrypted token
 * Output: Plain text token
 *
 * Called by: createJiraIssue, updateJiraIssue
 * Calls: Node crypto (simplified - use proper decryption in production)
 */
function decryptToken(encryptedToken: string): string {
  // TODO: Implement proper decryption with a secret key
  // For now, decode from base64 (NOT SECURE FOR PRODUCTION)
  return Buffer.from(encryptedToken, 'base64').toString('utf-8')
}
