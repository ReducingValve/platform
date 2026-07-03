import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME, SITE_DESCRIPTION, AUTHOR, CONTACT_EMAIL } from '../consts';
import { getPublishedEssays } from '../lib/essays';
import { essayHtml } from '../lib/feed';

export async function GET(context: APIContext) {
  const essays = await getPublishedEssays();

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site!,
    trailingSlash: false,
    items: await Promise.all(
      essays.map(async (essay) => ({
        title: essay.data.title,
        description: essay.data.dek,
        link: `/essays/${essay.id}`,
        pubDate: essay.data.date,
        author: `${CONTACT_EMAIL} (${AUTHOR})`,
        categories: essay.data.tags,
        // Full text, always (PLAN §4b).
        content: await essayHtml(essay),
      })),
    ),
    customData: '<language>en</language>',
  });
}
