/**
 * Supabase client configuration and database operations
 *
 * Provides Supabase client instances for server and client components
 * and common database operations
 */

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Create Supabase client for browser/client components
 *
 * Input: None
 * Output: Supabase client instance
 *
 * Called by: Client components, hooks
 * Calls: @supabase/ssr createBrowserClient
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

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

// ============================================================================
// Database Helper Functions
// ============================================================================

/**
 * Get current authenticated user
 *
 * Input: Supabase client instance
 * Output: User object or null
 *
 * Called by: All authenticated operations
 * Calls: supabase.auth.getUser
 */
export async function getCurrentUser(supabase: ReturnType<typeof createClient>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

/**
 * Check if user is authenticated
 *
 * Input: Supabase client instance
 * Output: Boolean
 *
 * Called by: Protected pages and components
 * Calls: getCurrentUser
 */
export async function isAuthenticated(supabase: ReturnType<typeof createClient>) {
  const user = await getCurrentUser(supabase)
  return user !== null
}
