import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, AUTHOR } from '../consts';
import { getPublishedEssays } from '../lib/essays';
import { essayHtml, canonicalUrl, escapeXml } from '../lib/feed';

export async function GET() {
  const essays = await getPublishedEssays();
  const updated = essays.length
    ? new Date(Math.max(...essays.map((e) => (e.data.updated ?? e.data.date).valueOf())))
    : new Date(0);

  const entries = await Promise.all(
    essays.map(async (essay) => {
      const url = canonicalUrl(essay);
      const html = await essayHtml(essay);
      return `  <entry>
    <title>${escapeXml(essay.data.title)}</title>
    <link rel="alternate" type="text/html" href="${url}"/>
    <id>${url}</id>
    <published>${essay.data.date.toISOString()}</published>
    <updated>${(essay.data.updated ?? essay.data.date).toISOString()}</updated>
    <summary>${escapeXml(essay.data.dek)}</summary>
${essay.data.tags.map((t) => `    <category term="${escapeXml(t)}"/>`).join('\n')}
    <content type="html">${escapeXml(html)}</content>
  </entry>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>${escapeXml(SITE_NAME)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link rel="alternate" type="text/html" href="${SITE_URL}"/>
  <link rel="self" type="application/atom+xml" href="${SITE_URL}/atom.xml"/>
  <id>${SITE_URL}/</id>
  <updated>${updated.toISOString()}</updated>
  <icon>${SITE_URL}/favicon.svg</icon>
  <author>
    <name>${escapeXml(AUTHOR)}</name>
    <uri>${SITE_URL}/about</uri>
  </author>
  <rights>CC BY-NC 4.0</rights>
${entries.join('\n')}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
