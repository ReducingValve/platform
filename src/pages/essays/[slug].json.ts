import type { APIContext } from 'astro';
import { getPublishedEssays, measure, type Essay } from '../../lib/essays';
import { proseOnly, canonicalUrl, essayText } from '../../lib/feed';
import { provenanceFor } from '../../lib/provenance';
import { AUTHOR, LICENSE, SITE_NAME, SITE_URL } from '../../consts';

export async function getStaticPaths() {
  const essays = await getPublishedEssays();
  return essays.map((essay) => ({ params: { slug: essay.id }, props: { essay } }));
}

/** Structured per-essay record (PLAN §Phase 3 + §4d). */
export async function GET({ props }: APIContext<{ essay: Essay }>) {
  const { essay } = props;
  const len = measure(essay.body ?? '');
  const prov = provenanceFor(essay);
  const canonical = canonicalUrl(essay);

  const record = {
    publication: { name: SITE_NAME, url: SITE_URL },
    id: essay.id,
    title: essay.data.title,
    abstract: essay.data.dek,
    author: { name: AUTHOR, url: `${SITE_URL}/about` },
    date_published: essay.data.date.toISOString(),
    date_modified: (essay.data.updated ?? essay.data.date).toISOString(),
    type: essay.data.type,
    issue: essay.data.issue ?? null,
    tags: essay.data.tags,
    license: { label: LICENSE.label, url: LICENSE.url },
    canonical,
    urls: {
      html: canonical,
      markdown: `${canonical}.md`,
      json: `${canonical}.json`,
    },
    length: { words: len.words, tokens_estimate: len.tokens, minutes: len.minutes },
    provenance: {
      version: prov.version,
      public_key_ed25519: prov.public_key_ed25519,
      body_sha256: prov.body_sha256,
      signed_payload: prov.payload,
      signature_ed25519: prov.signature,
      signed: prov.signed,
      composition: prov.composition,
      accountable: prov.accountable,
      verify: `${SITE_URL}/openness#verification`,
    },
    body_markdown: proseOnly(essay.body ?? ''),
    body_text: essayText(essay),
  };

  return new Response(JSON.stringify(record, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
