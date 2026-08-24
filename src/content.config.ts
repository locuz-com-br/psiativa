import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedAt: z.coerce.date().optional(),
    noindex: z.boolean().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    excerpt: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    cluster: z.string(),
    icp: z.string(),
    gapStage: z.string(),
    draft: z.boolean().default(false),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
  }),
});

const podcast = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/podcast' }),
  schema: z.object({
    title: z.string(),
    episodeTitle: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    duration: z.string(),
    durationISO: z.string(),
    episodeNumber: z.number(),
    audioUrl: z.string().url(),
    spotifyUrl: z.string().url(),
    guid: z.string(),
    words: z.number(),
    /** Curto demais / texto de terceiro: entra so no hub, sem pagina indexavel. */
    hubOnly: z.boolean().default(false),
  }),
});

export const collections = { pages, blog, podcast };
