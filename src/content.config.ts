import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    /** One-line standfirst shown under the title and used as the description. */
    dek: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(['essay', 'note']).default('essay'),
    /** Tags stay inside the locked triad. */
    tags: z.array(z.enum(['agents', 'markets', 'attention'])).default([]),
    issue: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { essays };
