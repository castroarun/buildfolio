/**
 * API route to send email via Gmail
 *
 * Input: POST request with email details (to, subject, body, attachMarkdown)
 * Output: Email send response
 *
 * Called by: Email action button in ActionsPanel
 * Calls: lib/gmail sendEmail, getGmailConfig
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'
import { sendEmail, getGmailConfig } from '@/lib/gmail'
import type { EmailRequest } from '@/types'

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
    const emailRequest: EmailRequest = body

    if (!emailRequest.to || !emailRequest.subject || !emailRequest.body) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      )
    }

    // Get Gmail configuration
    const gmailConfig = await getGmailConfig(user.id)

    if (!gmailConfig) {
      return NextResponse.json(
        { error: 'Gmail not configured. Please connect Gmail in settings.' },
        { status: 400 }
      )
    }

    // Send email
    const result = await sendEmail(gmailConfig, emailRequest)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Email sent successfully', messageId: result.messageId },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
