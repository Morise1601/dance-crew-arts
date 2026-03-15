import { createClient } from '@/lib/supabase/server'
import { AuthForm } from './components/AuthForm'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!user) {
        return <AuthForm />
    }

    // Check user role
    const { data: profile } = await supabase
        .from('admins')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()

    const userRole = ((profile as any)?.Role || (profile as any)?.role || '').toLowerCase()
    if (userRole === 'member') {
        redirect('/admin/settings/profile')
    }

    // User is admin — redirect to dashboard
    redirect('/admin/dashboard')
}
