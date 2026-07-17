import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const seoFields = {
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  descriptionGenerated: z.boolean().optional(),
  canonical: z.string().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  publishDate: z.coerce.date(),
  modifiedDate: z.coerce.date().optional(),
  format: z.enum(['html', 'markdown']).default('html'),
  sourceWordPressId: z.number().optional(),
};

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    ...seoFields,
    focusKeyword: z.string().optional(),
    author: z.string().default('Steven'),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    primaryCategory: z.string().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    featuredImageWidth: z.number().optional(),
    featuredImageHeight: z.number().optional(),
    ogImage: z.string().optional(),
    breadcrumbTitle: z.string().optional(),
    draft: z.boolean().default(false),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object(seoFields),
});

export const collections = { blog, pages };
