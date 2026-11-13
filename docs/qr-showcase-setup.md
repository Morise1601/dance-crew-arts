# QR showcase setup

The independent gallery is available at `/showcase`; administrators manage it at `/admin/qr-showcase`. Use the deployed `/showcase` URL when making a QR code with your preferred QR tool. The app does not generate QR codes.

Category links use the actual category names, for example `/showcase?category=Welcome%20Girls`, including Unicode names for custom Tamil categories. URL encoding preserves spaces and punctuation, so adding a similarly named service cannot send an existing link to the wrong category. Previously shared UUID links redirect to the current name link. Renaming a category changes its name link; adding or reordering categories preserves existing name links.

The public page uses uploaded image/video covers and illustrated artwork for empty collections. Opening a video by clicking or tapping its card starts playback; when sound is blocked, the player can fall back to muted playback with an unmute control. Closing the viewer stops playback. Hover/focus effects respect reduced-motion preferences. Admin category and upload editors stay sticky in the two-column layout at 1280px and above, with internal scrolling for tall forms; smaller screens use a normal stacked layout.

The gallery uses `public.qr_showcase_categories`, `public.qr_showcase_media`, and the public `qr-showcase` Storage bucket. It does not reuse or change `portfolio_assets` or the existing portfolio bucket.

## Configure the application

Set these variables in `.env.local` for local development and in the hosting platform's environment settings for deployment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_OR_SECRET_KEY
```

Keep `SUPABASE_SERVICE_ROLE_KEY` on the server. Never put its value in client code, a `NEXT_PUBLIC_` variable, source control, screenshots, or logs. A public/anon key is not a service key. The server first verifies the current user and trusted admin profile before using privileged operations, because service keys bypass RLS. See Supabase's [API key guidance](https://supabase.com/docs/guides/api/api-keys).

This project previously supported `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. Migrate that variable to `SUPABASE_SERVICE_ROLE_KEY`, remove the public-prefixed variable from every environment, and rebuild/redeploy. If a service credential was exposed through that public name, rotate it in Supabase and replace the affected deployments. Merely renaming an exposed key does not revoke it.

## Apply the database migration

Review `supabase/migrations/202611130001_qr_showcase.sql`, select the intended Supabase project, and execute it using the SQL editor or the project's normal migration process. This checkout does not automatically apply SQL or mutate the production project. Take the usual project backup before applying a migration.

The migration is transactional and can be rerun. It creates only the gallery's tables, helper, seed marker, policies and bucket; it leaves existing portfolio policies and content intact. It replaces policies bearing its own `qr_showcase_` names. An internal seed marker in `qr_showcase_private.seed_versions` ensures reruns do not restore categories an admin renamed or deleted. Keep that marker when retaining the gallery data. Reruns restore the gallery bucket's public flag and format/size restrictions.

Default categories are DJ, Firework, Doll Dance, Bouncers, Chenda Melam (சண்டா மேளம்), Low Fog, and Welcome Girls. Admins can rename them, choose icons, add new categories, change their display order, or delete empty categories. A database foreign key prevents deleting a category while it contains any media, including pending or hidden items. Category names are unique after trimming whitespace and ignoring case.

The migration assumes the existing `public.admins` table is authoritative and cannot be self-promoted by members. It does not alter that table or its policies. The helper checks the authenticated user's ID first. Only when there is no ID match does it compare a normalized email from a verified `auth.users` record with legacy profile emails; duplicate matches deny access. It trims and lowercases the existing `Role` field (or `role` in a lowercase schema), accepts only `admin`, and denies inactive profiles and unknown roles. A matching member/invalid profile never falls through to another email profile.

## Storage and publishing behavior

Accepted images are JPEG, PNG, WebP and GIF up to **10 MiB** (10,485,760 bytes). Accepted videos are MP4 and WebM up to **50 MiB** (52,428,800 bytes). Filenames/extensions, MIME types, size and file signatures must agree. MP4 playback depends on the browser's codec support; H.264/AAC is a practical compatibility choice.

The bucket's maximum size is 50 MiB, with the exact allowed MIME types `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `video/mp4`, and `video/webm`. The application and database enforce the smaller image limit. The project's global Storage upload limit must allow 50 MiB; a bucket limit cannot exceed the global limit. See [Supabase upload restrictions](https://supabase.com/docs/guides/storage/uploads/file-limits) and [bucket restrictions](https://supabase.com/docs/guides/storage/buckets/creating-buckets#restricting-uploads).

The admin flow creates a pending record, requests a signed upload token, and uploads the file directly to Storage. The binary does not pass through a Next.js server action, so a 15 MB action body limit does not cap video uploads. The server checks the stored file's signature, MIME and size before publishing the record. Pending, deleting and inactive records are excluded from public gallery queries. Use the admin page's cleanup/delete controls after an interrupted upload or deletion, and retry a failed upload with a fresh file selection. Cleanup removes files using the Supabase Storage API before removing their database records. Never delete rows directly from `storage.objects`; that leaves physical files unmanaged.

This is a **public bucket**: anyone who knows an object's URL can retrieve it, including a pending or hidden object's URL. Visibility switches control gallery listings, not confidentiality or cached copies. Only upload content suitable for public release. Anonymous visitors can read category rows and published, active media rows, but cannot list the bucket's objects or read pending metadata. Admins can manage all gallery rows and objects. Members cannot mutate them. The restrictive policies apply only to the `qr-showcase` bucket and prevent existing broad permissive Storage policies from granting nonadmins access to its object listing or writes. Other buckets retain their existing behavior. See [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## Audit findings and read-only checks

The audit used the configured Supabase key without printing its value or personal records. It could read the existing `admins` and `portfolio_assets` schemas and saw normalized profile-role counts of one admin and one member. The new gallery tables returned `PGRST205` (not present in the exposed schema cache). The configured service credential failed the Auth Admin API check with **401: This endpoint requires a valid Bearer token**. Replace it with the intended project's valid service-role/secret key under `SUPABASE_SERVICE_ROLE_KEY` before testing privileged operations. `storage.listBuckets()` returned an empty list; with this credential that does **not** prove the project has no buckets. The audit did not verify live PostgreSQL policy definitions or apply any migration.

After explicitly applying the migration, use the SQL editor for these read-only checks. They reveal configuration rather than secrets or file contents:

```sql
-- Both gallery tables should exist and have RLS enabled.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('qr_showcase_categories', 'qr_showcase_media');

-- Confirm lengths, MIME/type/size checks, unique storage paths and FK behavior.
select conrelid::regclass as table_name, conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in ('public.qr_showcase_categories'::regclass, 'public.qr_showcase_media'::regclass)
order by table_name, conname;

-- Includes the case-insensitive category-name index.
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('qr_showcase_categories', 'qr_showcase_media');

-- Inspect both gallery and existing Storage policies, including broad policies.
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in ('qr_showcase_categories', 'qr_showcase_media'))
   or (schemaname = 'storage' and tablename in ('buckets', 'objects'))
order by schemaname, tablename, policyname;

-- Expect public=true, 52428800 bytes, and exactly the six documented MIME types.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'qr-showcase';

-- SECURITY DEFINER=true; config must include an empty fixed search_path.
select p.proname, p.prosecdef, p.proconfig, p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'qr_showcase_is_admin';

-- Initial install: seven categories. Later counts legitimately reflect edits.
select name, icon, sort_order from public.qr_showcase_categories order by sort_order, created_at;
select status, is_active, count(*) from public.qr_showcase_media group by status, is_active;
select version, applied_at from qr_showcase_private.seed_versions;
```

The SQL editor commonly runs with elevated privileges, so successful editor queries do not demonstrate anon/member restrictions. Verify `/showcase` while logged out, then sign in separately as a member and admin. Confirm the member cannot call management actions or list/write gallery objects, the admin can complete an upload and metadata edit, and hidden/pending rows disappear from anonymous queries. Check the category grid, mobile media cards, image/video viewer, failed-upload cleanup and populated-category deletion. Run `node scripts/audit-supabase.mjs` locally for a credential-safe REST audit; treat it as an accessibility check, not a complete RLS proof.
