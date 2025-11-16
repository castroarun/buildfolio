/**
 * OAuth callback route handler for Google authentication
 *
 * Input: OAuth code from Google via URL parameters
 * Output: Redirects to home page with session set
 *
 * Called by: Google OAuth redirect
 * Calls: createServerComponentClient from lib/supabase
 */

import { createServerComponentClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createServerComponentClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after successful authentication
  return NextResponse.redirect(requestUrl.origin)
}
