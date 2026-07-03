import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, AUTHOR, LICENSE } from '../consts';
import { getPublishedEssays, measure } from '../lib/essays';
import { essayHtml, essayText, canonicalUrl } from '../lib/feed';
import { provenanceFor } from '../lib/provenance';

export async function GET() {
  const essays = await getPublishedEssays();

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_NAME,
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    description: SITE_DESCRIPTION,
    favicon: `${SITE_URL}/favicon.svg`,
    language: 'en',
    authors: [{ name: AUTHOR, url: `${SITE_URL}/about` }],
    items: await Promise.all(
      essays.map(async (essay) => {
        const len = measure(essay.body ?? '');
        const prov = provenanceFor(essay);
        return {
          id: canonicalUrl(essay),
          url: canonicalUrl(essay),
          title: essay.data.title,
          summary: essay.data.dek,
          // Full text in both forms, never truncated (PLAN §4b).
          content_html: await essayHtml(essay),
          content_text: essayText(essay),
          date_published: essay.data.date.toISOString(),
          date_modified: (essay.data.updated ?? essay.data.date).toISOString(),
          image: `${SITE_URL}/og/${essay.id}.png`,
          tags: essay.data.tags,
          language: 'en',
          authors: [{ name: AUTHOR, url: `${SITE_URL}/about` }],
          // Facets for reading agents (PLAN §4c): length in words and tokens.
          _reducing_valve: {
            type: essay.data.type,
            issue: essay.data.issue ?? null,
            word_count: len.words,
            token_count_estimate: len.tokens,
            license: LICENSE.url,
            signed: prov.signed,
            public_key_ed25519: prov.public_key_ed25519,
            signature_ed25519: prov.signature,
            markdown_url: `${canonicalUrl(essay)}.md`,
            json_url: `${canonicalUrl(essay)}.json`,
          },
        };
      }),
    ),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
}
