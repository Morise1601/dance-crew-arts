export const SHOWCASE_BUCKET = 'qr-showcase';
export const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_BYTES = 50 * 1024 * 1024;
export const CATEGORY_ICON_KEYS = ['music', 'sparkles', 'drama', 'shield', 'drum', 'cloud', 'flower', 'star'] as const;
export const MEDIA_FORMATS: Record<string, { extensions: string[]; kind: 'image' | 'video'; max: number }> = {
  'image/jpeg': { extensions: ['jpg', 'jpeg'], kind: 'image', max: IMAGE_MAX_BYTES },
  'image/png': { extensions: ['png'], kind: 'image', max: IMAGE_MAX_BYTES },
  'image/webp': { extensions: ['webp'], kind: 'image', max: IMAGE_MAX_BYTES },
  'image/gif': { extensions: ['gif'], kind: 'image', max: IMAGE_MAX_BYTES },
  'video/mp4': { extensions: ['mp4'], kind: 'video', max: VIDEO_MAX_BYTES },
  'video/webm': { extensions: ['webm'], kind: 'video', max: VIDEO_MAX_BYTES },
};
export const MEDIA_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm';
export const isUuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const validOrder = (value: unknown) => typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 9999;

export function validateMediaFile(file: { name: string; type: string; size: number } | null): string | null {
  if (!file || typeof file.name !== 'string' || typeof file.type !== 'string') return 'Choose an image or video.';
  const format = MEDIA_FORMATS[file.type];
  if (!format) return 'Use JPEG, PNG, WebP, GIF, MP4 or WebM files.';
  if (!format.extensions.includes(file.name.split('.').pop()?.toLowerCase() || '')) return 'The file extension does not match its format.';
  if (!Number.isSafeInteger(file.size) || file.size <= 0) return 'The file is empty or has an invalid size.';
  if (file.size > format.max) return `${format.kind === 'image' ? 'Images' : 'Videos'} must be ${format.kind === 'image' ? '10' : '50'} MB or smaller.`;
  return null;
}

export function validateCategory(value: { name: string; icon: string; sort_order: number }): string | null {
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > 60) return 'Category name must contain 1–60 characters.';
  if (!CATEGORY_ICON_KEYS.includes(value.icon as typeof CATEGORY_ICON_KEYS[number])) return 'Choose a category icon.';
  if (!validOrder(value.sort_order)) return 'Display order must be a whole number from 0 to 9999.';
  return null;
}

export function validateMediaDetails(value: { name: string; description: string; category_id: string; sort_order: number }): string | null {
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > 100) return 'Media title must contain 1–100 characters.';
  if (typeof value.description !== 'string' || value.description.trim().length > 500) return 'Description must be 500 characters or fewer.';
  if (!isUuid(value.category_id)) return 'Choose a valid category.';
  if (!validOrder(value.sort_order)) return 'Display order must be a whole number from 0 to 9999.';
  return null;
}

export function matchesMediaSignature(bytes: Uint8Array, mime: string): boolean {
  const text = (offset: number, count: number) => String.fromCharCode(...bytes.slice(offset, offset + count));
  switch (mime) {
    case 'image/jpeg': return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    case 'image/png': return [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
    case 'image/gif': return ['GIF87a', 'GIF89a'].includes(text(0, 6));
    case 'image/webp': return text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP';
    case 'video/mp4': return bytes.length >= 12 && text(4, 4) === 'ftyp' && /^(isom|iso[2-9]|mp4[12]|avc1|dash|M4V |MSNV)/.test(text(8, 4));
    case 'video/webm': return [26, 69, 223, 163].every((value, i) => bytes[i] === value) && text(0, bytes.length).includes('webm');
    default: return false;
  }
}
