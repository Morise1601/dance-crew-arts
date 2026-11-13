-- Independent QR showcase. Apply explicitly to the intended Supabase project.
-- This migration never changes portfolio_assets or the portfolio bucket.
begin;

create schema if not exists qr_showcase_private;
revoke all on schema qr_showcase_private from public, anon, authenticated;

-- A persistent marker prevents a rerun from restoring renamed/deleted defaults.
create table if not exists qr_showcase_private.seed_versions (
    version text primary key,
    applied_at timestamptz not null default now()
);
alter table qr_showcase_private.seed_versions enable row level security;
revoke all on qr_showcase_private.seed_versions from public, anon, authenticated;

create or replace function public.qr_showcase_is_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    caller_id uuid := auth.uid();
    verified_email text;
    matches jsonb;
    profile jsonb;
begin
    if caller_id is null then
        return false;
    end if;

    -- ID wins even if its profile is inactive, a member, or has an unknown role.
    select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a)) into matches
    from public.admins as a
    where pg_catalog.to_jsonb(a) ->> 'id' = caller_id::text;

    if matches is null then
        -- Legacy profiles may have independent IDs. Trust only the verified
        -- email in auth.users, never user-editable JWT metadata/request input.
        select pg_catalog.lower(pg_catalog.btrim(u.email)) into verified_email
        from auth.users as u
        where u.id = caller_id and u.email_confirmed_at is not null;

        if verified_email is null or verified_email = '' then
            return false;
        end if;

        select pg_catalog.jsonb_agg(pg_catalog.to_jsonb(a)) into matches
        from public.admins as a
        where pg_catalog.lower(pg_catalog.btrim(pg_catalog.to_jsonb(a) ->> 'email')) = verified_email;
    end if;

    -- Ambiguous email matches fail closed instead of choosing an admin record.
    if matches is null or pg_catalog.jsonb_array_length(matches) <> 1 then
        return false;
    end if;
    profile := matches -> 0;

    if profile -> 'is_active' = 'false'::jsonb then
        return false;
    end if;

    -- JSONB supports the existing capital-R column and a lowercase-role schema.
    return coalesce(
        pg_catalog.lower(pg_catalog.btrim(coalesce(profile ->> 'Role', profile ->> 'role'))) = 'admin',
        false
    );
end;
$$;

revoke all on function public.qr_showcase_is_admin() from public;
grant execute on function public.qr_showcase_is_admin() to anon, authenticated;

create table if not exists public.qr_showcase_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 60 and btrim(name) <> ''),
    icon text not null default 'star'
        check (icon in ('music', 'sparkles', 'drama', 'shield', 'drum', 'cloud', 'flower', 'star')),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamptz not null default now()
);
create unique index if not exists qr_showcase_categories_normalized_name_key
    on public.qr_showcase_categories (lower(btrim(name)));
create index if not exists qr_showcase_categories_sort_idx
    on public.qr_showcase_categories (sort_order, created_at);

create table if not exists public.qr_showcase_media (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.qr_showcase_categories(id) on delete restrict,
    name text not null check (char_length(name) between 1 and 100 and btrim(name) <> ''),
    description text not null default '' check (char_length(description) <= 500),
    url text not null check (btrim(url) <> ''),
    storage_path text not null unique check (btrim(storage_path) <> ''),
    media_type text not null check (media_type in ('image', 'video')),
    mime_type text not null check (
        mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm')
    ),
    size_bytes bigint not null check (size_bytes > 0),
    sort_order integer not null default 0 check (sort_order between 0 and 9999),
    is_active boolean not null default true,
    status text not null default 'pending' check (status in ('pending', 'published', 'deleting')),
    created_by uuid default auth.uid() references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    constraint qr_showcase_media_type_size_check check (
        (media_type = 'image'
            and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
            and size_bytes <= 10485760)
        or
        (media_type = 'video'
            and mime_type in ('video/mp4', 'video/webm')
            and size_bytes <= 52428800)
    )
);
create index if not exists qr_showcase_media_category_sort_idx
    on public.qr_showcase_media (category_id, sort_order, created_at);
create index if not exists qr_showcase_media_public_idx
    on public.qr_showcase_media (category_id, sort_order, created_at)
    where status = 'published' and is_active;

alter table public.qr_showcase_categories enable row level security;
alter table public.qr_showcase_media enable row level security;

-- Remove inherited broad grants on these two new tables only; RLS governs DML.
revoke all on public.qr_showcase_categories, public.qr_showcase_media from public, anon, authenticated;
grant select on public.qr_showcase_categories, public.qr_showcase_media to anon, authenticated;
grant insert, update, delete on public.qr_showcase_categories, public.qr_showcase_media to authenticated;
grant all on public.qr_showcase_categories, public.qr_showcase_media to service_role;

drop policy if exists qr_showcase_categories_public_read on public.qr_showcase_categories;
create policy qr_showcase_categories_public_read on public.qr_showcase_categories
    for select to anon, authenticated using (true);
drop policy if exists qr_showcase_categories_admin_write on public.qr_showcase_categories;
create policy qr_showcase_categories_admin_write on public.qr_showcase_categories
    for all to authenticated
    using ((select public.qr_showcase_is_admin()))
    with check ((select public.qr_showcase_is_admin()));

drop policy if exists qr_showcase_media_public_read on public.qr_showcase_media;
create policy qr_showcase_media_public_read on public.qr_showcase_media
    for select to anon, authenticated using (status = 'published' and is_active);
drop policy if exists qr_showcase_media_admin_access on public.qr_showcase_media;
create policy qr_showcase_media_admin_access on public.qr_showcase_media
    for all to authenticated
    using ((select public.qr_showcase_is_admin()))
    with check ((select public.qr_showcase_is_admin()));

-- Restrictive guards also prevent an unrelated permissive policy from widening
-- access to these tables on a later rerun. They grant no access by themselves.
drop policy if exists qr_showcase_media_read_guard on public.qr_showcase_media;
create policy qr_showcase_media_read_guard on public.qr_showcase_media
    as restrictive for select to anon, authenticated
    using ((status = 'published' and is_active) or (select public.qr_showcase_is_admin()));

do $$
declare
    table_name text;
    operation text;
    policy_name text;
begin
    foreach table_name in array array['qr_showcase_categories', 'qr_showcase_media'] loop
        foreach operation in array array['insert', 'update', 'delete'] loop
            policy_name := table_name || '_' || operation || '_guard';
            execute format('drop policy if exists %I on public.%I', policy_name, table_name);
            if operation = 'insert' then
                execute format(
                    'create policy %I on public.%I as restrictive for insert to anon, authenticated with check ((select public.qr_showcase_is_admin()))',
                    policy_name, table_name
                );
            elsif operation = 'update' then
                execute format(
                    'create policy %I on public.%I as restrictive for update to anon, authenticated using ((select public.qr_showcase_is_admin())) with check ((select public.qr_showcase_is_admin()))',
                    policy_name, table_name
                );
            else
                execute format(
                    'create policy %I on public.%I as restrictive for delete to anon, authenticated using ((select public.qr_showcase_is_admin()))',
                    policy_name, table_name
                );
            end if;
        end loop;
    end loop;
end;
$$;

do $$
begin
    if not exists (select 1 from qr_showcase_private.seed_versions where version = '202611130001-default-categories') then
        insert into public.qr_showcase_categories (id, name, icon, sort_order) values
            ('c54a7c01-8467-4c00-a000-000000000001', 'DJ', 'music', 10),
            ('c54a7c01-8467-4c00-a000-000000000002', 'Firework', 'sparkles', 20),
            ('c54a7c01-8467-4c00-a000-000000000003', 'Doll Dance', 'drama', 30),
            ('c54a7c01-8467-4c00-a000-000000000004', 'Bouncers', 'shield', 40),
            ('c54a7c01-8467-4c00-a000-000000000005', 'Chenda Melam', 'drum', 50),
            ('c54a7c01-8467-4c00-a000-000000000006', 'Low Fog', 'cloud', 60),
            ('c54a7c01-8467-4c00-a000-000000000007', 'Welcome Girls', 'flower', 70)
        on conflict do nothing;

        insert into qr_showcase_private.seed_versions (version) values ('202611130001-default-categories');
    end if;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'qr-showcase', 'qr-showcase', true, 52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket URLs may be fetched by anybody who knows the path. Public
-- listing and writes still require RLS. Guards apply only to this bucket and
-- leave policy behavior for every other bucket unchanged.
drop policy if exists qr_showcase_objects_admin on storage.objects;
create policy qr_showcase_objects_admin on storage.objects
    for all to authenticated
    using (bucket_id = 'qr-showcase' and (select public.qr_showcase_is_admin()))
    with check (bucket_id = 'qr-showcase' and (select public.qr_showcase_is_admin()));

drop policy if exists qr_showcase_objects_guard on storage.objects;
create policy qr_showcase_objects_guard on storage.objects
    as restrictive for all to anon, authenticated
    using (bucket_id <> 'qr-showcase' or (select public.qr_showcase_is_admin()))
    with check (bucket_id <> 'qr-showcase' or (select public.qr_showcase_is_admin()));

drop policy if exists qr_showcase_bucket_admin on storage.buckets;
create policy qr_showcase_bucket_admin on storage.buckets
    for all to authenticated
    using (id = 'qr-showcase' and (select public.qr_showcase_is_admin()))
    with check (id = 'qr-showcase' and (select public.qr_showcase_is_admin()));

drop policy if exists qr_showcase_bucket_guard on storage.buckets;
create policy qr_showcase_bucket_guard on storage.buckets
    as restrictive for all to anon, authenticated
    using (id <> 'qr-showcase' or (select public.qr_showcase_is_admin()))
    with check (id <> 'qr-showcase' or (select public.qr_showcase_is_admin()));

-- Storage objects are deleted through the Storage API, never raw SQL DELETE.
notify pgrst, 'reload schema';
commit;
