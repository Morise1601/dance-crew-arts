import { createClient } from '@/lib/supabase/server'
import PortfolioClient from './PortfolioClient'

export default async function PortfolioPage() {
    const supabase = await createClient()

    // Fetch only active videos and photos from portfolio_assets
    const { data: assets } = await supabase
        .from('portfolio_assets')
        .select('*')
        .in('type', ['video', 'photos'])
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    return <PortfolioClient initialAssets={assets || []} />
}
