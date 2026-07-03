import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, AUTHOR, CONTACT_EMAIL, LICENSE } from '../consts';
import { getPublishedEssays, measure, formatDate } from '../lib/essays';
import { canonicalUrl } from '../lib/feed';

export async function GET() {
  const essays = await getPublishedEssays();

  const essayLines = essays.map((essay) => {
    const len = measure(essay.body ?? '');
    return `- [${essay.data.title}](${canonicalUrl(essay)}): ${essay.data.dek} (${formatDate(
      essay.data.date,
    )}; ${len.words.toLocaleString('en-US')} words, ~${len.tokens.toLocaleString('en-US')} tokens)`;
  });

  const text = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Written by ${AUTHOR}. Reading agents are welcome — this file is one door among
several. Full-text feeds are never truncated. Essays are licensed ${LICENSE.label}
(${LICENSE.url}): share and adapt for non-commercial use with attribution and a
canonical link; commercial reuse needs a note first. A structured content API and
an MCP endpoint, with Ed25519-signed provenance per essay, are planned; the
posture is documented at ${SITE_URL}/openness.

## Essays

${essayLines.join('\n')}

## Pages

- [About](${SITE_URL}/about): who writes this, why, and where the provenance key will be published
- [Manifesto](${SITE_URL}/manifesto): the five commitments the publication holds itself to
- [Openness](${SITE_URL}/openness): every door, listed — humans, feeds, programs, crawlers, agents

## Feeds

- [RSS](${SITE_URL}/rss.xml): full text
- [Atom](${SITE_URL}/atom.xml): full text
- [JSON Feed](${SITE_URL}/feed.json): full text plus word/token-count facets

Contact: ${CONTACT_EMAIL}
`;

  return new Response(text, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
