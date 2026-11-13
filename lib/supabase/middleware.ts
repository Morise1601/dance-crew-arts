import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

    // Every admin sub-route needs a session, including settings and new modules.
    // Role authorization is enforced again by server pages and server actions.
    const isProtectedAdminRoute = pathname.startsWith('/admin/')

    if (!user && isProtectedAdminRoute) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin'
        const response = NextResponse.redirect(loginUrl)
        supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
        return response
    }

    return supabaseResponse
}
