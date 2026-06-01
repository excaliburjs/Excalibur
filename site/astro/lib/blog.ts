import type { CollectionEntry } from 'astro:content';

export function getBlogRoute(entry: CollectionEntry<'blog'>) {
  const slug = normalizeSlug(entry.data.slug);
  if (slug) {
    return slug;
  }

  const parts = entry.id.split('/');
  const fileName = parts.at(-1) ?? entry.id;
  const folderName = parts.length > 1 ? parts.at(-2) : undefined;
  const source = folderName && /^\d{4}/.test(folderName) ? folderName : fileName;

  return source.replace(/\.(md|mdx)$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\s+/g, '-').toLowerCase();
}

export function getBlogPermalink(entry: CollectionEntry<'blog'>) {
  return `/blog/${getBlogRoute(entry)}/`;
}

export function getBlogDate(entry: CollectionEntry<'blog'>) {
  const date = entry.data.date;
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date);
  }

  const dateMatch = entry.id.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    return new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}T00:00:00.000Z`);
  }

  return new Date(0);
}

function normalizeSlug(slug: string | undefined) {
  return slug?.replace(/^\/blog\//, '').replace(/^\//, '').replace(/\/$/, '');
}
