import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ShowcaseData } from './types';

export async function getPublicShowcase(): Promise<ShowcaseData> {
  try {
    const client = await createClient();
    const [categories, media] = await Promise.all([
      client.from('qr_showcase_categories').select('*').order('sort_order').order('name'),
      client.from('qr_showcase_media').select('*').eq('status', 'published').eq('is_active', true).order('sort_order').order('created_at', { ascending: false }),
    ]);
    if (categories.error || media.error) return { categories: [], media: [], error: 'The showcase is being prepared. Please check back soon.' };
    return { categories: categories.data || [], media: media.data || [], error: null };
  } catch {
    return { categories: [], media: [], error: 'The showcase is temporarily unavailable. Please try again shortly.' };
  }
}
