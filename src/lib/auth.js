import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { resolveUserRole, hasPermission, getPermissionsForRole } from '@/lib/rbac'
import { redirect } from 'next/navigation'

/**
 * Get current authenticated user and verify admin status.
 * Server-only utility for Server Components, Server Actions, and Route Handlers.
 */
export async function getCurrentAdminUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return null
    }

    // Use admin client to query profiles safely, avoiding any RLS restrictions
    const adminDb = createAdminClient()
    const { data: profile, error: profileError } = await adminDb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching admin profile:', profileError)
    }

    const role = resolveUserRole(profile, user)
    const isAdmin = Boolean(role)
    const permissions = role ? getPermissionsForRole(role) : []

    return {
      user,
      profile: profile || null,
      role,
      isAdmin,
      permissions,
    }
  } catch (err) {
    // Next.js internal errors (like redirects and dynamic server signals) must be re-thrown
    if (err?.digest?.startsWith('NEXT_REDIRECT') || err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
      throw err
    }
    console.error('getCurrentAdminUser error:', err)
    return null
  }
}

/**
 * Enforce that the user is an authenticated administrator.
 * If permission is specified, additionally verify that the admin has that permission.
 * Redirects appropriately if unauthorized.
 */
export async function requireAdmin(requiredPermission = null) {
  const adminData = await getCurrentAdminUser()

  if (!adminData || !adminData.user) {
    redirect('/login')
  }

  if (!adminData.isAdmin) {
    redirect('/unauthorized')
  }

  if (requiredPermission && !hasPermission(adminData.role, requiredPermission)) {
    redirect(`/forbidden?permission=${encodeURIComponent(requiredPermission)}`)
  }

  return adminData
}

/**
 * For Route Handlers / API routes: verify admin credentials without redirecting.
 * Returns { authorized: true, ...adminData } or { authorized: false, response: NextResponse }
 */
export async function verifyApiAdmin(requiredPermission = null) {
  const adminData = await getCurrentAdminUser()

  if (!adminData || !adminData.user) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication required. Please sign in.',
    }
  }

  if (!adminData.isAdmin) {
    return {
      authorized: false,
      status: 403,
      error: 'Access denied. Account lacks administrative privileges.',
    }
  }

  if (requiredPermission && !hasPermission(adminData.role, requiredPermission)) {
    return {
      authorized: false,
      status: 403,
      error: `Access denied. Lacks required permission: ${requiredPermission}`,
    }
  }

  return {
    authorized: true,
    ...adminData,
  }
}
