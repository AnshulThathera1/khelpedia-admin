import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Public routes that do not require admin authentication
const PUBLIC_ROUTES = [
  '/login',
  '/auth/callback',
  '/auth/signout',
  '/unauthorized',
  '/forbidden',
  '/robots.txt',
]

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Enforce Network Isolation & SEO Block Headers on ALL requests
  supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  supabaseResponse.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  supabaseResponse.headers.set('Content-Security-Policy', "frame-ancestors 'none';")

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          // Re-apply security headers
          supabaseResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, notranslate')
          supabaseResponse.headers.set('X-Frame-Options', 'DENY')
          supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
          supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Allow static files and public routes without check
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // 1. Unauthenticated user trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return copyHeaders(NextResponse.redirect(url), supabaseResponse)
  }

  // 2. Authenticated user
  if (user) {
    // Check if user has admin privileges
    let isAdmin = false
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profile && profile.is_admin === true) {
        isAdmin = true
      }
    } catch {
      // In case of error, default to false
      isAdmin = false
    }

    // Authenticated user on /login:
    // If admin -> redirect to /overview
    // If not admin -> redirect to /unauthorized
    if (pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = isAdmin ? '/overview' : '/unauthorized'
      url.searchParams.delete('redirectTo')
      return copyHeaders(NextResponse.redirect(url), supabaseResponse)
    }

    // Authenticated non-admin trying to access protected route
    if (!isAdmin && !isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/unauthorized'
      return copyHeaders(NextResponse.redirect(url), supabaseResponse)
    }
  }

  return supabaseResponse
}

function copyHeaders(targetResponse, sourceResponse) {
  sourceResponse.headers.forEach((value, key) => {
    targetResponse.headers.set(key, value)
  })
  return targetResponse
}
