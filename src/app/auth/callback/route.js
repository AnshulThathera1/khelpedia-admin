import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/overview'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // Verify admin status
      try {
        const adminDb = createAdminClient()
        const { data: profile } = await adminDb
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        if (profile?.is_admin === true) {
          // Authorized admin
          return NextResponse.redirect(`${origin}${next}`)
        } else {
          // Authenticated but NOT an admin
          return NextResponse.redirect(`${origin}/unauthorized`)
        }
      } catch (err) {
        console.error('Error verifying admin in auth callback:', err)
        return NextResponse.redirect(`${origin}/unauthorized`)
      }
    } else {
      console.error('Auth code exchange error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth-failure`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=missing-code`)
}
