import { getPublishedEssays, measure } from '../../lib/essays';
import { canonicalUrl } from '../../lib/feed';
import { provenanceFor, PUBLIC_KEY_HEX } from '../../lib/provenance';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, AUTHOR, LICENSE, MCP_URL } from '../../consts';

/** Content API index (PLAN §Phase 3). Chronological, newest first — the only order. */
export async function GET() {
  const essays = await getPublishedEssays();

  const index = {
    publication: {
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      author: { name: AUTHOR, url: `${SITE_URL}/about` },
      public_key_ed25519: PUBLIC_KEY_HEX,
      license_default: { label: LICENSE.label, url: LICENSE.url },
    },
    doors: {
      rss: `${SITE_URL}/rss.xml`,
      atom: `${SITE_URL}/atom.xml`,
      json_feed: `${SITE_URL}/feed.json`,
      llms_txt: `${SITE_URL}/llms.txt`,
      mcp: MCP_URL,
      openness: `${SITE_URL}/openness`,
    },
    count: essays.length,
    essays: essays.map((essay) => {
      const len = measure(essay.body ?? '');
      const prov = provenanceFor(essay);
      const canonical = canonicalUrl(essay);
      return {
        id: essay.id,
        title: essay.data.title,
        abstract: essay.data.dek,
        date_published: essay.data.date.toISOString(),
        type: essay.data.type,
        issue: essay.data.issue ?? null,
        tags: essay.data.tags,
        length: { words: len.words, tokens_estimate: len.tokens, minutes: len.minutes },
        signed: prov.signed,
        composition: prov.composition,
        urls: { html: canonical, markdown: `${canonical}.md`, json: `${canonical}.json` },
      };
    }),
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
