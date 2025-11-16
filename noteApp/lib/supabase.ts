/**
 * Supabase server client for server components and API routes
 *
 * IMPORTANT: This file uses next/headers and can ONLY be imported by server components
 * For client components, use lib/supabase-client.ts instead
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Create Supabase client for server components
 *
 * Input: None
 * Output: Supabase client instance with cookie handling
 *
 * Called by: Server components, API routes
 * Calls: @supabase/ssr createServerClient, next/headers cookies
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component - ignore cookie setting errors
          }
        },
      },
    }
  )
}
