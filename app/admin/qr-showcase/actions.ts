'use server';

import { requireAdmin } from '@/lib/auth/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { MEDIA_FORMATS, SHOWCASE_BUCKET, isUuid, matchesMediaSignature, validateCategory, validateMediaDetails, validateMediaFile } from '@/lib/showcase/validation';

type CategoryInput = { id?: string; name: string; icon: string; sort_order: number };
type MediaInput = { name: string; description: string; category_id: string; sort_order: number; is_active?: boolean };
type Result = { success?: boolean; error?: string; upload?: { id: string; path: string; token: string } };
const refresh = () => { revalidatePath('/admin/qr-showcase'); revalidatePath('/showcase'); };
const failure = (error: unknown): Result => ({ error: error instanceof Error && error.message === 'Unauthorized' ? 'Admin permission is required.' : 'Unable to complete this request. Check the Supabase setup and try again.' });
const dbError = (error: { code?: string; message?: string }): Result => ({ error: error.code === '23505' ? 'A category with this name already exists.' : error.code === '23503' ? 'Remove or move the media in this category before deleting it.' : 'Unable to save. Check the Supabase setup and try again.' });

export async function saveCategory(input: CategoryInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!input) return { error: 'Enter category details.' };
    const invalid = validateCategory(input);
    if (invalid) return { error: invalid };
    if (input.id !== undefined && !isUuid(input.id)) return { error: 'Invalid category.' };
    const client = await createAdminClient();
    const row = { name: input.name.trim(), icon: input.icon, sort_order: input.sort_order };
    const result = input.id
      ? await client.from('qr_showcase_categories').update(row).eq('id', input.id).select('id').maybeSingle()
      : await client.from('qr_showcase_categories').insert(row).select('id').single();
    if (result.error) return dbError(result.error);
    if (!result.data) return { error: 'This category no longer exists. Refresh the page.' };
    refresh(); return { success: true };
  } catch (error) { return failure(error); }
}

export async function deleteCategory(id: string): Promise<Result> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { error: 'Invalid category.' };
    const client = await createAdminClient();
    const { error } = await client.from('qr_showcase_categories').delete().eq('id', id);
    if (error) return dbError(error);
    refresh(); return { success: true };
  } catch (error) { return failure(error); }
}

export async function prepareMediaUpload(input: MediaInput & { file: { name: string; type: string; size: number } }): Promise<Result> {
  try {
    const { user } = await requireAdmin();
    if (!input) return { error: 'Enter media details.' };
    const invalid = validateMediaDetails(input) || validateMediaFile(input.file);
    if (invalid) return { error: invalid };
    const client = await createAdminClient();
    const { data: category, error: categoryError } = await client.from('qr_showcase_categories').select('id').eq('id', input.category_id).maybeSingle();
    if (categoryError || !category) return { error: 'This category is unavailable. Refresh and choose another category.' };
    const id = crypto.randomUUID();
    const extension = MEDIA_FORMATS[input.file.type].extensions[0];
    const storagePath = `${user.id}/${id}.${extension}`;
    const { data: { publicUrl } } = client.storage.from(SHOWCASE_BUCKET).getPublicUrl(storagePath);
    const { error } = await client.from('qr_showcase_media').insert({
      id, category_id: input.category_id, name: input.name.trim(), description: input.description.trim(),
      url: publicUrl, storage_path: storagePath, media_type: MEDIA_FORMATS[input.file.type].kind,
      mime_type: input.file.type, size_bytes: input.file.size, sort_order: input.sort_order,
      is_active: true, status: 'pending', created_by: user.id,
    });
    if (error) return dbError(error);
    const { data, error: signError } = await client.storage.from(SHOWCASE_BUCKET).createSignedUploadUrl(storagePath, { upsert: false });
    if (signError || !data) {
      await client.from('qr_showcase_media').delete().eq('id', id).eq('status', 'pending');
      return { error: 'Unable to start upload. Check that the qr-showcase bucket is configured.' };
    }
    return { upload: { id, path: storagePath, token: data.token } };
  } catch (error) { return failure(error); }
}

export async function completeMediaUpload(id: string): Promise<Result> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { error: 'Invalid media.' };
    const client = await createAdminClient();
    const { data: row, error } = await client.from('qr_showcase_media').select('*').eq('id', id).maybeSingle();
    if (error || !row) return { error: 'Upload record was not found. Please upload again.' };
    if (row.status === 'published') return { success: true };
    if (row.status !== 'pending') return { error: 'This media is being deleted.' };
    const { data: info, error: infoError } = await client.storage.from(SHOWCASE_BUCKET).info(row.storage_path);
    if (infoError || !info) return { error: 'The upload is incomplete. Retry verification or remove it and upload again.' };
    const metadata = info.metadata as { size?: number; mimetype?: string } | null;
    const actualSize = Number(metadata?.size ?? info.size);
    const actualMime = metadata?.mimetype ?? info.contentType;
    const validation = validateMediaFile({ name: row.storage_path, type: actualMime || '', size: actualSize });
    if (validation || actualMime !== row.mime_type || actualSize !== Number(row.size_bytes)) return { error: 'Uploaded file type or size does not match. Remove this upload and choose a valid file.' };
    // Derive the trusted URL from our bucket/path; never fetch a user-supplied URL.
    const { data: { publicUrl } } = client.storage.from(SHOWCASE_BUCKET).getPublicUrl(row.storage_path);
    const response = await fetch(publicUrl, { headers: { Range: 'bytes=0-511' }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok || !response.body) return { error: 'Unable to verify this upload. Please retry verification.' };
    const reader = response.body.getReader();
    const prefix = new Uint8Array(512);
    let length = 0;
    try {
      while (length < prefix.length) {
        const { done, value } = await reader.read();
        if (done) break;
        const count = Math.min(value.length, prefix.length - length);
        prefix.set(value.subarray(0, count), length); length += count;
      }
    } finally { await reader.cancel(); }
    if (!matchesMediaSignature(prefix.subarray(0, length), row.mime_type)) return { error: 'The file contents do not match the selected format. Remove it and upload a valid image or video.' };
    const { data: published, error: publishError } = await client.from('qr_showcase_media').update({ status: 'published', url: publicUrl }).eq('id', id).eq('status', 'pending').select('id').maybeSingle();
    if (publishError || !published) return { error: 'Unable to publish. Retry verification or refresh the page.' };
    refresh(); return { success: true };
  } catch (error) { return failure(error); }
}

export async function updateMedia(id: string, input: MediaInput): Promise<Result> {
  try {
    await requireAdmin();
    if (!isUuid(id) || !input) return { error: 'Invalid media.' };
    const invalid = validateMediaDetails(input);
    if (invalid) return { error: invalid };
    if (typeof input.is_active !== 'boolean') return { error: 'Choose media visibility.' };
    const client = await createAdminClient();
    const { data, error } = await client.from('qr_showcase_media').update({
      name: input.name.trim(), description: input.description.trim(), category_id: input.category_id,
      sort_order: input.sort_order, is_active: input.is_active,
    }).eq('id', id).select('id').maybeSingle();
    if (error) return dbError(error);
    if (!data) return { error: 'This media no longer exists. Refresh the page.' };
    refresh(); return { success: true };
  } catch (error) { return failure(error); }
}

export async function deleteMedia(id: string): Promise<Result> {
  try {
    await requireAdmin();
    if (!isUuid(id)) return { error: 'Invalid media.' };
    const client = await createAdminClient();
    const { data: row, error } = await client.from('qr_showcase_media').select('id,storage_path,status').eq('id', id).maybeSingle();
    if (error) return dbError(error);
    if (!row) return { success: true };
    // Hide the record before deleting its file. Failed DB cleanup remains retryable.
    const { error: hideError } = await client.from('qr_showcase_media').update({ status: 'deleting' }).eq('id', id);
    if (hideError) return dbError(hideError);
    const { error: storageError } = await client.storage.from(SHOWCASE_BUCKET).remove([row.storage_path]);
    if (storageError) {
      await client.from('qr_showcase_media').update({ status: row.status }).eq('id', id).eq('status', 'deleting');
      refresh(); return { error: 'File deletion failed. The record has been kept; please retry.' };
    }
    const { error: deleteError } = await client.from('qr_showcase_media').delete().eq('id', id).eq('status', 'deleting');
    refresh();
    if (deleteError) return { error: 'The file was removed; retry delete to finish cleaning up the record.' };
    return { success: true };
  } catch (error) { return failure(error); }
}
