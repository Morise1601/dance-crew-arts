import type { AdminRole } from './roles'

export function getAdminNavigation(role: AdminRole) {
    return [
        ...(role === 'admin' ? [
            { href: '/admin/dashboard', label: 'Overview', icon: 'overview' },
            { href: '/admin/messages', label: 'Messages', icon: 'messages' },
            { href: '/admin/team', label: 'Team Members', icon: 'team' },
            { href: '/admin/portfolio', label: 'My Portfolio', icon: 'portfolio' },
            { href: '/admin/qr-showcase', label: 'QR Showcase', icon: 'qr' },
        ] : []),
        { href: '/admin/settings/profile', label: 'Profile Settings', icon: 'profile' },
        ...(role === 'admin' ? [{ href: '/admin/settings/app', label: 'App Settings', icon: 'settings' }] : []),
    ]
}
