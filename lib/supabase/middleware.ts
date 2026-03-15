import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protected admin sub-routes (NOT the login page itself)
const PROTECTED_ADMIN_ROUTES = [
    '/admin/dashboard',
    '/admin/team',
    '/admin/portfolio',
]

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh the auth token
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    const pathname = request.nextUrl.pathname

    // If user is NOT logged in and tries to access a protected admin sub-route → redirect to home
    const isProtectedAdminRoute = PROTECTED_ADMIN_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    if (!user && isProtectedAdminRoute) {
        const homeUrl = request.nextUrl.clone()
        homeUrl.pathname = '/'
        return NextResponse.redirect(homeUrl)
    }

    return supabaseResponse
}
