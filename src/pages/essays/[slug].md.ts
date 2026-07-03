import type { APIContext } from 'astro';
import { getPublishedEssays, measure, type Essay } from '../../lib/essays';
import { proseOnly, canonicalUrl } from '../../lib/feed';
import { provenanceFor } from '../../lib/provenance';
import { AUTHOR, LICENSE, SITE_NAME } from '../../consts';

export async function getStaticPaths() {
  const essays = await getPublishedEssays();
  return essays.map((essay) => ({ params: { slug: essay.id }, props: { essay } }));
}

/** The cheapest agent food there is: frontmatter + full prose markdown. */
export async function GET({ props }: APIContext<{ essay: Essay }>) {
  const { essay } = props;
  const len = measure(essay.body ?? '');
  const prov = provenanceFor(essay);
  const canonical = canonicalUrl(essay);

  const doc = `---
publication: ${SITE_NAME}
title: ${essay.data.title}
dek: ${essay.data.dek}
author: ${AUTHOR}
date: ${essay.data.date.toISOString().slice(0, 10)}
type: ${essay.data.type}${essay.data.issue ? `\nissue: ${essay.data.issue}` : ''}
tags: [${essay.data.tags.join(', ')}]
license: ${LICENSE.label} (${LICENSE.url})
canonical: ${canonical}
words: ${len.words}
tokens_estimate: ${len.tokens}
provenance:
  version: ${prov.version}
  public_key_ed25519: ${prov.public_key_ed25519}
  body_sha256: ${prov.body_sha256}
  signature_ed25519: ${prov.signature ?? 'unsigned'}
  composition: ${prov.composition}
  accountable: ${prov.accountable}
  verify: ${canonical.replace(/\/essays\/.*$/, '')}/openness#verification
---

${proseOnly(essay.body ?? '')}
`;

  return new Response(doc, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
