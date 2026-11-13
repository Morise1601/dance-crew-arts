import { redirect } from 'next/navigation';
import { getCurrentProfile } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminSidebar } from '../components/AdminSidebar';
import ShowcaseManager from './showcase-manager';

export default async function QRShowcasePage() {
  const { user, profile, role } = await getCurrentProfile();
  if (!user) redirect('/admin');
  if (role !== 'admin') redirect('/admin/settings/profile');
  const client = await createAdminClient();
  const [categories, media] = await Promise.all([
    client.from('qr_showcase_categories').select('*').order('sort_order').order('name'),
    client.from('qr_showcase_media').select('*').order('sort_order').order('created_at', { ascending: false }),
  ]);
  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <AdminSidebar initialProfile={profile} />
      <main className="min-w-0 flex-1 px-4 pb-12 pt-24 sm:px-8 lg:p-10 xl:p-12">
        <ShowcaseManager categories={categories.data || []} media={media.data || []} setupError={Boolean(categories.error || media.error)} />
      </main>
    </div>
  );
}
