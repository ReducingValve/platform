import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: ({ image }) =>
    z.object({
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
      /** Commissioned banner art (riso register, no text in image).
       *  Omit → the generative valve-field fallback renders instead. */
      banner: image().optional(),
      /** Art provenance, keyed by role: 'cover' for the banner, the image
       *  file's basename (no extension) for in-body figures. Credit is
       *  displayed; the generation prompt is disclosed on hover/tap. */
      figures: z
        .record(
          z.object({
            credit: z.string(),
            prompt: z.string().optional(),
          }),
        )
        .optional(),
    }),
});

export const collections = { essays };
