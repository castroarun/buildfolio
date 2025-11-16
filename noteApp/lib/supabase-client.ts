/**
 * Supabase client for browser/client components
 *
 * This file can be imported by client components
 */

import { createBrowserClient } from '@supabase/ssr'
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
