import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, AUTHOR, CONTACT_EMAIL, LICENSE, MCP_URL } from '../consts';
import { getPublishedEssays, measure, formatDate } from '../lib/essays';
import { canonicalUrl } from '../lib/feed';
import { PUBLIC_KEY_HEX } from '../lib/provenance';

export async function GET() {
  const essays = await getPublishedEssays();

  const essayLines = essays.map((essay) => {
    const len = measure(essay.body ?? '');
    const url = canonicalUrl(essay);
    return `- [${essay.data.title}](${url}): ${essay.data.dek} (${formatDate(
      essay.data.date,
    )}; ${len.words.toLocaleString('en-US')} words, ~${len.tokens.toLocaleString('en-US')} tokens; markdown: ${url}.md; json: ${url}.json)`;
  });

  const text = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Written by ${AUTHOR}. Reading agents are welcome — this file is one door among
several. Full-text feeds are never truncated. Essays are licensed ${LICENSE.label}
(${LICENSE.url}): share and adapt for non-commercial use with attribution and a
canonical link; commercial reuse needs a note first. Every essay is also served
as raw markdown and structured JSON with an Ed25519 provenance signature
(public key ${PUBLIC_KEY_HEX}); the posture and
verification instructions live at ${SITE_URL}/openness.

## Essays

${essayLines.join('\n')}

## For agents

- [Content API index](${SITE_URL}/api/essays.json): all essays, structured
- MCP endpoint (streamable HTTP): ${MCP_URL}
- Verification: ${SITE_URL}/openness#verification

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
