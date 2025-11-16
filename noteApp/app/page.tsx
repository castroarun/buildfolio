import { createServerComponentClient } from '@/lib/supabase'
import { AuthSignIn } from '@/ui/components/Auth'
import { MainApp } from '@/ui/components/MainApp'

/**
 * Main application page - Note taking interface
 *
 * Input: None (server component)
 * Output: Authentication UI or main note-taking interface
 *
 * Called by: Next.js app router
 * Calls: createServerComponentClient, AuthSignIn, MainApp
 */
export default async function Home() {
  const supabase = await createServerComponentClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Show auth page if not logged in
  if (!user) {
    return <AuthSignIn />
  }

  // Show main app if logged in
  return <MainApp user={user} />
}
