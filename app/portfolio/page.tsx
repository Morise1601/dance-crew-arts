import { createClient } from '@/lib/supabase/server'
import PortfolioClient from './PortfolioClient'

export default async function PortfolioPage() {
    const supabase = await createClient()

    // Fetch only active videos from portfolio_assets
    const { data: assets } = await supabase
        .from('portfolio_assets')
        .select('*')
        .eq('type', 'video')
        .eq('is_active', true) // Filter by active status
        .order('created_at', { ascending: false })

    return <PortfolioClient initialVideos={assets || []} />
}
