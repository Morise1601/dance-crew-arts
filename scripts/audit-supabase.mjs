import { createClient } from '@supabase/supabase-js';

try { process.loadEnvFile('.env.local'); } catch { /* environment may be injected */ }
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
console.log('Configuration:', { url: Boolean(url), anon: Boolean(anon), service: Boolean(service) });
if (service) {
  let keyRole = 'opaque';
  try { keyRole = JSON.parse(Buffer.from(service.split('.')[1], 'base64url').toString()).role || 'unknown'; } catch { /* modern opaque keys */ }
  console.log('Privileged key check:', { sameAsAnon: service === anon, keyRole, secretKey: service.startsWith('sb_secret_') });
}
if (!url || !anon) process.exit(1);
const client = createClient(url, service || anon, { auth: { persistSession: false, autoRefreshToken: false } });
for (const table of ['admins', 'portfolio_assets', 'qr_showcase_categories', 'qr_showcase_media']) {
  const { data, error } = await client.from(table).select('*').limit(1);
  console.log(table, error ? { code: error.code, message: error.message } : { accessible: true, sampleColumns: Object.keys(data?.[0] || {}) });
}
const { data: profiles, error: profileError } = await client.from('admins').select('*');
if (!profileError) {
  const counts = {};
  for (const row of profiles) {
    const role = typeof (row.Role ?? row.role) === 'string' ? (row.Role ?? row.role).trim().toLowerCase() : 'missing';
    counts[role] = (counts[role] || 0) + 1;
  }
  console.log('Visible profile role counts:', counts);
}
if (service) {
  const { data: users, error: usersError } = await client.auth.admin.listUsers({ page: 1, perPage: 100 });
  console.log('Admin API capability:', usersError ? { accessible: false, status: usersError.status, message: usersError.message } : { accessible: true, profileIdsMatchAuth: profiles ? profiles.every(row => users.users.some(user => user.id === row.id)) : null });
  const { data, error } = await client.storage.listBuckets();
  console.log('Buckets:', error ? { message: error.message } : data.map(({ name, public: isPublic, file_size_limit, allowed_mime_types }) => ({ name, public: isPublic, file_size_limit, allowed_mime_types })));
} else console.log('Bucket listing requires SUPABASE_SERVICE_ROLE_KEY; no privileged audit performed.');
