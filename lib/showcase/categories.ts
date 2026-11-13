import type { ShowcaseCategory, ShowcaseMedia } from './types';

export type ShowcaseCollection = ShowcaseCategory & {
  slug: string;
  media_count: number;
  cover: ShowcaseMedia | null;
};

/** Use the unique category name itself; lossy slugs can collide as services grow. */
export function createCategorySlug(name: string): string {
  return name.trim();
}

export function buildShowcaseCategoryHref(slug: string): string {
  return `/showcase?category=${encodeURIComponent(slug)}`;
}

export function getShowcaseCategories(categories: ShowcaseCategory[], media: ShowcaseMedia[]): ShowcaseCollection[] {
  const visible = media.filter(item => item.status === 'published' && item.is_active);
  return categories.map(category => {
    const collection = visible.filter(item => item.category_id === category.id);
    return {
      ...category,
      slug: createCategorySlug(category.name),
      media_count: collection.length,
      cover: collection.find(item => item.media_type === 'image') ?? collection[0] ?? null,
    };
  });
}

/** Accept old UUID bookmarks and exact category names, but emit name-based links. */
export function resolveShowcaseCategory(categories: ShowcaseCollection[], token: string | null | undefined): ShowcaseCollection | null {
  if (!token) return null;
  return categories.find(category => category.slug === token)
    ?? categories.find(category => category.id === token)
    ?? categories.find(category => category.name.trim().toLowerCase() === token.trim().toLowerCase())
    ?? null;
}
