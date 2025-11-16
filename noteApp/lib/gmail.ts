/**
 * Gmail API integration library
 *
 * Handles Gmail API interactions for sending emails
 * with note content and attachments
 */

import type { GmailConfig, EmailRequest, EmailResponse } from '@/types'
import { createServerComponentClient } from './supabase'

/**
 * Get Gmail configuration for current user
 *
 * Input: userId
 * Output: GmailConfig or null
 *
 * Called by: API routes
 * Calls: supabase.from('gmail_configs').select
 */
export async function getGmailConfig(userId: string): Promise<GmailConfig | null> {
  const supabase = await createServerComponentClient()

  const { data, error } = await supabase
    .from('gmail_configs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return data as GmailConfig
}

/**
 * Save or update Gmail configuration
 *
 * Input: userId, config data
 * Output: Success boolean
 *
 * Called by: OAuth callback or settings
 * Calls: supabase.from('gmail_configs').upsert
 */
export async function saveGmailConfig(
  userId: string,
  config: Omit<GmailConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  const supabase = await createServerComponentClient()

  const { error } = await supabase.from('gmail_configs').upsert({
    user_id: userId,
    email: config.email,
    access_token_encrypted: config.access_token_encrypted,
    refresh_token_encrypted: config.refresh_token_encrypted,
    expires_at: config.expires_at,
  })

  return !error
}

/**
 * Send email using Gmail API
 *
 * Input: config, email request
 * Output: Email response with success status
 *
 * Called by: /api/gmail/send route
 * Calls: Gmail API, decryptToken, refreshAccessTokenIfNeeded
 */
export async function sendEmail(
  config: GmailConfig,
  request: EmailRequest
): Promise<EmailResponse> {
  try {
    // Refresh access token if expired
    const validConfig = await refreshAccessTokenIfNeeded(config)

    // Build email message in RFC 2822 format
    const message = buildEmailMessage(request)

    // Send via Gmail API
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptToken(validConfig.access_token_encrypted)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: Buffer.from(message).toString('base64url'),
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to send email')
    }

    const data = await response.json()

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error: any) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email',
    }
  }
}

/**
 * Build email message in RFC 2822 format
 *
 * Input: Email request
 * Output: RFC 2822 formatted message string
 *
 * Called by: sendEmail
 * Calls: None
 */
function buildEmailMessage(request: EmailRequest): string {
  const lines: string[] = []

  // Headers
  lines.push(`To: ${request.to}`)
  lines.push(`Subject: ${request.subject}`)
  lines.push('MIME-Version: 1.0')

  if (request.attachMarkdown) {
    // Multipart message with attachment
    const boundary = '----=_Part_' + Date.now()
    lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`)
    lines.push('')
    lines.push(`--${boundary}`)
    lines.push('Content-Type: text/plain; charset=UTF-8')
    lines.push('')
    lines.push(request.body)
    lines.push('')
    lines.push(`--${boundary}`)
    lines.push('Content-Type: text/markdown; name="note.md"')
    lines.push('Content-Disposition: attachment; filename="note.md"')
    lines.push('Content-Transfer-Encoding: base64')
    lines.push('')
    lines.push(Buffer.from(request.body).toString('base64'))
    lines.push('')
    lines.push(`--${boundary}--`)
  } else {
    // Simple text message
    lines.push('Content-Type: text/plain; charset=UTF-8')
    lines.push('')
    lines.push(request.body)
  }

  return lines.join('\r\n')
}

/**
 * Refresh Gmail access token if expired
 *
 * Input: Current config
 * Output: Updated config with fresh token
 *
 * Called by: sendEmail
 * Calls: Google OAuth token endpoint, saveGmailConfig
 */
async function refreshAccessTokenIfNeeded(
  config: GmailConfig
): Promise<GmailConfig> {
  const now = Date.now()

  // If token expires in less than 5 minutes, refresh it
  if (config.expires_at > now + 5 * 60 * 1000) {
    return config
  }

  try {
    const refreshToken = decryptToken(config.refresh_token_encrypted)

    // TODO: Add your Google OAuth client ID and secret from environment variables
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const data = await response.json()

    const newConfig: GmailConfig = {
      ...config,
      access_token_encrypted: encryptToken(data.access_token),
      expires_at: now + data.expires_in * 1000,
    }

    // Save updated config
    await saveGmailConfig(config.user_id, newConfig)

    return newConfig
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw new Error('Gmail access expired. Please reconnect Gmail.')
  }
}

/**
 * Encrypt token for storage
 *
 * Input: Plain text token
 * Output: Encrypted token
 *
 * Called by: saveGmailConfig, refreshAccessTokenIfNeeded
 * Calls: Node crypto (simplified)
 */
function encryptToken(token: string): string {
  // TODO: Implement proper encryption with a secret key
  // For now, return base64 encoded (NOT SECURE FOR PRODUCTION)
  return Buffer.from(token).toString('base64')
}

/**
 * Decrypt token from storage
 *
 * Input: Encrypted token
 * Output: Plain text token
 *
 * Called by: sendEmail, refreshAccessTokenIfNeeded
 * Calls: Node crypto (simplified)
 */
function decryptToken(encryptedToken: string): string {
  // TODO: Implement proper decryption with a secret key
  // For now, decode from base64 (NOT SECURE FOR PRODUCTION)
  return Buffer.from(encryptedToken, 'base64').toString('utf-8')
}
