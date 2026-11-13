'use client';

/* eslint-disable @next/next/no-img-element -- Storage URLs and local blob previews use their original responsive media. */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, Film, ImageIcon, Loader2, Pencil, Plus, QrCode, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { ShowcaseCategoryIcon, SHOWCASE_ICONS } from '@/components/showcase/category-icon';
import type { ShowcaseCategory, ShowcaseMedia } from '@/lib/showcase/types';
import { MEDIA_ACCEPT, SHOWCASE_BUCKET, matchesMediaSignature, validateCategory, validateMediaDetails, validateMediaFile } from '@/lib/showcase/validation';
import { completeMediaUpload, deleteCategory, deleteMedia, prepareMediaUpload, saveCategory, updateMedia } from './actions';

const inputClass = 'w-full rounded-xl border border-white/15 bg-black px-3 py-3 text-sm text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50';
const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-gray-200 transition hover:border-primary/50 hover:text-primary disabled:opacity-50';
const primaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black transition hover:bg-primary/85 disabled:opacity-50';
const blankMedia = { name: '', description: '', category_id: '', sort_order: 0, is_active: true };
const blankCategory = { name: '', icon: 'star', sort_order: 0 };
type MediaForm = typeof blankMedia;

async function inspectFile(file: File) {
  const error = validateMediaFile(file);
  if (error) throw new Error(error);
  if (!matchesMediaSignature(new Uint8Array(await file.slice(0, 512).arrayBuffer()), file.type)) throw new Error('The file contents do not match its format. Choose a valid image or video.');
  const url = URL.createObjectURL(file);
  try {
    await new Promise<void>((resolve, reject) => {
      const media = file.type.startsWith('image/') ? new Image() : document.createElement('video');
      const finish = (error?: string) => {
        clearTimeout(timer);
        media.onload = null; media.onerror = null;
        if (media instanceof HTMLVideoElement) { media.onloadedmetadata = null; media.removeAttribute('src'); media.load(); }
        if (error) reject(new Error(error));
        else resolve();
      };
      const timer = setTimeout(() => finish('Unable to read this file. Try exporting it again.'), 15000);
      media.onerror = () => finish('This browser cannot open the file. For videos, use MP4 (H.264/AAC) or WebM.');
      if (media instanceof HTMLVideoElement) { media.preload = 'metadata'; media.onloadedmetadata = () => finish(); }
      else media.onload = () => finish();
      media.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

export default function ShowcaseManager({ categories, media, setupError }: { categories: ShowcaseCategory[]; media: ShowcaseMedia[]; setupError: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<'media' | 'categories'>('media');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [mediaForm, setMediaForm] = useState<MediaForm>(blankMedia);
  const [editingMedia, setEditingMedia] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState(blankCategory);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const report = (message: string) => { setError(message); toast.error(message); };
  const resetMedia = () => { setMediaForm(blankMedia); setEditingMedia(null); setFile(null); setPreview(''); if (fileInput.current) fileInput.current.value = ''; };
  async function perform(key: string, work: () => Promise<{ error?: string; success?: boolean }>, message: string) {
    setBusy(key); setError('');
    try {
      const result = await work();
      if (result.error) { report(result.error); return false; }
      toast.success(message); router.refresh(); return true;
    } catch { report('Connection interrupted. Please try again.'); return false; }
    finally { setBusy(null); }
  }

  async function submitMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const invalid = validateMediaDetails(mediaForm);
    if (invalid) { report(invalid); return; }
    if (editingMedia) {
      if (await perform('save', () => updateMedia(editingMedia, mediaForm), 'Media updated.')) resetMedia();
      return;
    }
    if (!file) { report('Choose an image or video.'); return; }
    setBusy('Checking file…');
    let uploadId: string | undefined;
    let stored = false;
    try {
      await inspectFile(file);
      setBusy('Preparing upload…');
      const prepared = await prepareMediaUpload({ ...mediaForm, file: { name: file.name, type: file.type, size: file.size } });
      if (prepared.error || !prepared.upload) throw new Error(prepared.error || 'Unable to start upload.');
      uploadId = prepared.upload.id;
      setBusy('Uploading to storage…');
      const client = createClient();
      const result = await client.storage.from(SHOWCASE_BUCKET).uploadToSignedUrl(prepared.upload.path, prepared.upload.token, file, { contentType: file.type, cacheControl: '3600' });
      if (result.error) throw new Error('Upload failed. Check your connection and try again.');
      stored = true;
      setBusy('Verifying & publishing…');
      const completed = await completeMediaUpload(uploadId);
      if (completed.error) throw new Error(`${completed.error} The pending record below lets you retry verification or delete it.`);
      toast.success('Media uploaded and published.'); resetMedia();
    } catch (reason) {
      if (uploadId && !stored) {
        const cleanup = await deleteMedia(uploadId);
        if (cleanup.error) toast.error('A pending upload remains. Use Delete below to clean it up.');
      }
      report(reason instanceof Error ? reason.message : 'Upload interrupted. Please try again.');
    } finally { setBusy(null); router.refresh(); }
  }

  const shown = media.filter(item => !filter || item.category_id === filter);
  const published = media.filter(item => item.status === 'published' && item.is_active).length;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-primary"><QrCode size={16} /> Service showcase</div>
          <h1 className="text-3xl sm:text-4xl">Curate the <span className="italic text-primary">experience.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">Organise your services, add your best moments, and share one beautiful gallery.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButton} onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/showcase`); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { report('Copy the /showcase URL from the preview page.'); } }}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Link copied' : 'Copy public link'}</button>
          <Link href="/showcase" target="_blank" rel="noopener noreferrer" className={primaryButton}>Preview gallery <ExternalLink size={16} /></Link>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {[['Categories', categories.length], ['Published', published], ['Total media', media.length]].map(([label, count]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.025] p-4 sm:p-5"><p className="text-xs text-gray-400">{label}</p><p className="mt-2 text-2xl font-semibold text-primary">{count}</p></div>)}
      </div>
      {setupError ? <div role="alert" className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-sm leading-7"><p className="font-semibold text-primary">Supabase setup is required, or the database is currently unavailable.</p><p className="text-gray-300">Run <code className="break-all">supabase/migrations/202611130001_qr_showcase.sql</code> in the Supabase SQL Editor and configure <code>SUPABASE_SERVICE_ROLE_KEY</code> on the server. Setup instructions are in <code>docs/qr-showcase-setup.md</code>.</p><button onClick={() => router.refresh()} className={`${secondaryButton} mt-4`}><RefreshCw size={16} /> Retry</button></div> : <>
        <div className="flex gap-2 border-b border-white/10 pb-3" aria-label="Showcase management sections">
          {(['media', 'categories'] as const).map(value => <button key={value} disabled={Boolean(busy)} aria-pressed={tab === value} className={`${secondaryButton} ${tab === value ? 'border-primary/40 bg-primary/10 text-primary' : ''}`} onClick={() => { setTab(value); setError(''); }}>{value === 'media' ? <ImageIcon size={16} /> : <Plus size={16} />}{value === 'media' ? 'Media library' : 'Categories'}</button>)}
        </div>
        {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        {tab === 'categories' ? <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <form onSubmit={async event => { event.preventDefault(); const invalid = validateCategory(categoryForm); if (invalid) return report(invalid); if (await perform('category', () => saveCategory({ ...categoryForm, ...(editingCategory ? { id: editingCategory } : {}) }), editingCategory ? 'Category updated.' : 'Category added.')) { setCategoryForm(blankCategory); setEditingCategory(null); } }} className="min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 sm:p-6 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:self-start xl:overflow-y-auto">
            <h2 className="text-xl">{editingCategory ? 'Edit category' : 'New category'}</h2>
            <label className="block space-y-2 text-sm text-gray-300"><span>Name <span className="text-primary">*</span></span><input required maxLength={60} className={inputClass} value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="e.g. Live Music" /></label>
            <fieldset><legend className="mb-2 text-sm text-gray-300">Category icon</legend><div className="grid grid-cols-4 gap-2">{SHOWCASE_ICONS.map(icon => <button key={icon.value} type="button" aria-label={icon.label} title={icon.label} aria-pressed={categoryForm.icon === icon.value} onClick={() => setCategoryForm({ ...categoryForm, icon: icon.value })} className={`flex min-h-12 items-center justify-center rounded-xl border ${categoryForm.icon === icon.value ? 'border-primary bg-primary/10 text-primary' : 'border-white/10 text-gray-400'}`}><ShowcaseCategoryIcon name={icon.value} className="size-5" /></button>)}</div></fieldset>
            <label className="block space-y-2 text-sm text-gray-300"><span>Display order</span><input type="number" min={0} max={9999} step={1} required className={inputClass} value={categoryForm.sort_order} onChange={e => setCategoryForm({ ...categoryForm, sort_order: Number(e.target.value) })} /><span className="block text-xs text-gray-500">Lower numbers appear first.</span></label>
            <div className="flex flex-wrap gap-2"><button disabled={Boolean(busy)} className={primaryButton}>{busy === 'category' && <Loader2 size={16} className="animate-spin" />}{editingCategory ? 'Save category' : 'Add category'}</button>{editingCategory && <button type="button" disabled={Boolean(busy)} className={secondaryButton} onClick={() => { setEditingCategory(null); setCategoryForm(blankCategory); }}>Cancel</button>}</div>
          </form>
          <section className="space-y-3" aria-label="Existing categories">
            {categories.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-gray-400">Add your first service category to begin.</p>}
            {categories.map(category => { const count = media.filter(item => item.category_id === category.id).length; return <div key={category.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[.02] p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShowcaseCategoryIcon name={category.icon} className="size-5" /></div><div className="min-w-0 flex-1"><h3 className="break-words font-sans text-sm font-semibold">{category.name}</h3><p className="mt-1 text-xs text-gray-500">{count} media · Order {category.sort_order}</p></div><button disabled={Boolean(busy)} title={`Edit ${category.name}`} aria-label={`Edit ${category.name}`} className={secondaryButton} onClick={() => { setEditingCategory(category.id); setCategoryForm({ name: category.name, icon: category.icon, sort_order: category.sort_order }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil size={15} /></button><button disabled={Boolean(busy) || count > 0} title={count ? 'Move or delete media before deleting this category' : `Delete ${category.name}`} aria-label={`Delete ${category.name}`} className={`${secondaryButton} text-red-300`} onClick={() => { if (window.confirm(`Delete category “${category.name}”?`)) void perform(category.id, () => deleteCategory(category.id), 'Category deleted.'); }}><Trash2 size={15} /></button></div>; })}
            <p className="px-1 text-xs leading-6 text-gray-500">Categories with media cannot be deleted. Move or remove their media first, including pending uploads.</p>
          </section>
        </div> : <div className="grid items-start gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <div ref={editor} className="min-w-0 scroll-mt-24 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:self-start xl:overflow-y-auto">
            <form onSubmit={submitMedia} className="space-y-5 rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-xl">{editingMedia ? 'Edit media' : 'Add a moment'}</h2>{editingMedia && <button type="button" disabled={Boolean(busy)} aria-label="Cancel edit" onClick={resetMedia} className="p-2 text-gray-400"><X size={20} /></button>}</div>
              <fieldset disabled={Boolean(busy) || !categories.length} className="space-y-5 disabled:opacity-60">
                <label className="block space-y-2 text-sm text-gray-300"><span>Category <span className="text-primary">*</span></span><select required className={inputClass} value={mediaForm.category_id} onChange={e => setMediaForm({ ...mediaForm, category_id: e.target.value })}><option value="">Choose a service</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
                <label className="block space-y-2 text-sm text-gray-300"><span>Media title <span className="text-primary">*</span></span><input required maxLength={100} className={inputClass} value={mediaForm.name} onChange={e => setMediaForm({ ...mediaForm, name: e.target.value })} placeholder="Give this moment a name" /></label>
                <label className="block space-y-2 text-sm text-gray-300"><span>Description <span className="text-gray-500">(optional)</span></span><textarea rows={2} maxLength={500} className={inputClass} value={mediaForm.description} onChange={e => setMediaForm({ ...mediaForm, description: e.target.value })} /></label>
                {!editingMedia && <div className="space-y-3"><label className="block cursor-pointer rounded-xl border border-dashed border-primary/30 bg-primary/[.03] p-5 text-center"><Upload className="mx-auto mb-2 size-6 text-primary" /><span className="block text-sm text-gray-200">Choose an image or video</span><span className="mt-1 block text-xs leading-6 text-gray-500">JPEG, PNG, WebP, GIF · max 10 MB<br />MP4, WebM · max 50 MB</span><input ref={fileInput} aria-label="Image or video file" type="file" required accept={MEDIA_ACCEPT} className="mt-3 w-full min-w-0 text-xs text-gray-400 file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white" onChange={e => { const selected = e.target.files?.[0] || null; const invalid = selected ? validateMediaFile(selected) : null; setError(invalid || ''); setFile(invalid ? null : selected); setPreview(''); if (invalid) { toast.error(invalid); e.target.value = ''; } }} /></label>{file && preview && <div className="overflow-hidden rounded-xl border border-white/10">{file.type.startsWith('video/') ? <video src={preview} controls playsInline preload="metadata" className="max-h-56 w-full bg-black" /> : <img src={preview} alt="Selected file preview" className="max-h-56 w-full object-contain" />}<p className="break-all p-3 text-xs text-gray-400">{file.name} · {(file.size / 1048576).toFixed(1)} MB</p></div>}<p className="text-xs leading-5 text-gray-500">Use MP4 with H.264/AAC for widest device support. Keep this page open until publishing finishes.</p></div>}
                <label className="block space-y-2 text-sm text-gray-300"><span>Display order</span><input required type="number" min={0} max={9999} step={1} className={inputClass} value={mediaForm.sort_order} onChange={e => setMediaForm({ ...mediaForm, sort_order: Number(e.target.value) })} /></label>
                {editingMedia && <label className="flex min-h-11 items-center gap-3 text-sm text-gray-300"><input type="checkbox" checked={mediaForm.is_active} onChange={e => setMediaForm({ ...mediaForm, is_active: e.target.checked })} className="size-4 accent-primary" />Show in public gallery</label>}
                <button className={`${primaryButton} w-full`} disabled={Boolean(busy)}>{busy ? <Loader2 size={17} className="animate-spin" /> : <Upload size={17} />}{busy || (editingMedia ? 'Save changes' : 'Upload & publish')}</button>
              </fieldset>
              {!categories.length && <p className="text-sm text-primary">Create a category first in the Categories tab.</p>}
              {busy && <p role="status" className="text-center text-xs text-primary">{busy === 'save' ? 'Saving changes…' : busy}</p>}
            </form>
          </div>
          <section aria-label="Media library" className="min-w-0 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><h2 className="text-xl">Your media <span className="font-sans text-sm text-gray-500">({shown.length})</span></h2><select aria-label="Filter media by category" value={filter} onChange={e => setFilter(e.target.value)} className={`${inputClass} sm:max-w-60`}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
            {shown.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><Film className="mx-auto mb-4 size-8 text-primary/50" /><p className="text-sm text-gray-300">The stage is yours.</p><p className="mt-2 text-xs leading-6 text-gray-500">Upload your first image or video to bring this gallery to life.</p></div> : <div className="grid gap-4 sm:grid-cols-2">
              {shown.map(item => <article key={item.id} className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]">
                <div className="relative aspect-video overflow-hidden bg-white/[.03]">{item.status === 'published' ? item.media_type === 'video' ? <video src={item.url} controls playsInline preload="none" aria-label={item.name} className="h-full w-full object-contain" /> : <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500"><Upload size={24} /><span className="text-xs">{item.status === 'deleting' ? 'Cleanup needed' : 'Verification pending'}</span></div>}</div>
                <div className="space-y-3 p-4"><div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{categories.find(category => category.id === item.category_id)?.name}</p><h3 className="break-words font-sans text-sm font-semibold">{item.name}</h3>{item.description && <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-gray-500">{item.description}</p>}</div><div className="flex flex-wrap gap-2 text-[10px] text-gray-400"><span className="rounded-md bg-white/5 px-2 py-1">{item.media_type} · {(item.size_bytes / 1048576).toFixed(1)} MB</span><span className={`rounded-md px-2 py-1 ${item.status === 'published' && item.is_active ? 'bg-green-400/10 text-green-300' : 'bg-primary/10 text-primary'}`}>{item.status !== 'published' ? item.status : item.is_active ? 'Public' : 'Hidden'}</span></div><div className="flex flex-wrap gap-2">{item.status === 'pending' && <button disabled={Boolean(busy)} className={`${secondaryButton} flex-1 text-xs`} onClick={() => void perform(item.id, () => completeMediaUpload(item.id), 'Media verified and published.')}><RefreshCw size={14} />Verify</button>}{item.status === 'published' && <button disabled={Boolean(busy)} className={`${secondaryButton} flex-1 text-xs`} onClick={() => { setEditingMedia(item.id); setMediaForm({ name: item.name, description: item.description, category_id: item.category_id, sort_order: item.sort_order, is_active: item.is_active }); setFile(null); editor.current?.scrollIntoView({ behavior: 'smooth' }); }}><Pencil size={14} />Edit</button>}<button aria-label={`Delete ${item.name}`} disabled={Boolean(busy)} className={`${secondaryButton} text-red-300`} onClick={() => { if (window.confirm(`Delete “${item.name}” and its stored file? This cannot be undone.`)) void perform(item.id, () => deleteMedia(item.id), 'Media deleted.').then(ok => { if (ok && editingMedia === item.id) resetMedia(); }); }}>{busy === item.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</button></div></div>
              </article>)}
            </div>}
          </section>
        </div>}
      </>}
    </div>
  );
}
