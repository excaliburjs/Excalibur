import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './astro/content/blog' }),
  schema: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.union([z.string(), z.date()]).optional(),
      authors: z.union([z.string(), z.array(z.string())]).optional(),
      author: z.string().optional(),
      slug: z.string().optional(),
      tags: z.array(z.string()).optional(),
      image: z.string().optional(),
      draft: z.boolean().optional()
    })
    .passthrough()
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader({ generateId: generateDocsId }),
    schema: docsSchema({
      extend: z
        .object({
          slug: z.string().optional(),
          section: z.string().optional(),
          tags: z.array(z.string()).optional()
        })
        .passthrough()
    })
  }),
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  blog
};

function generateDocsId({ data, entry }: { data: Record<string, unknown>; entry: string }) {
  if (typeof data.slug !== 'string') {
    throw new Error(`Missing docs slug frontmatter in ${entry}`);
  }

  const slug = data.slug.replace(/^\/+/, '').replace(/\/+$/, '');
  return slug ? `docs/${slug}` : 'docs';
}
