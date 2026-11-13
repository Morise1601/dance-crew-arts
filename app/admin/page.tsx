import { getCurrentProfile } from '@/lib/auth/server'
import { AuthForm } from './components/AuthForm'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
    const { user, role } = await getCurrentProfile()

    if (!user) {
        return <AuthForm />
    }

    redirect(role === 'admin' ? '/admin/dashboard' : '/admin/settings/profile')
}
