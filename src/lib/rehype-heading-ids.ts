/**
 * Give every markdown heading a slug `id`, so in-text references can deep-link
 * to a section (e.g. the essay body pointing at its own appendices). Uses the
 * already-installed github-slugger for GitHub-compatible, de-duplicated slugs.
 *
 * h2/h3 also get a build-time self-link appended (zero JS): a faint "#"
 * anchor that CSS reveals on heading hover / anchor focus, so readers can
 * copy a section link. Styled under `.prose .heading-anchor` in global.css.
 */
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';
import GithubSlugger from 'github-slugger';

function textOf(node: Element): string {
  let s = '';
  visit(node, 'text', (t: { value: string }) => {
    s += t.value;
  });
  return s;
}

export default function rehypeHeadingIds() {
  return (tree: Root) => {
    const slugger = new GithubSlugger();
    visit(tree, 'element', (node: Element) => {
      if (!/^h[1-6]$/.test(node.tagName)) return;
      const props = (node.properties ||= {});
      if (!props.id) props.id = slugger.slug(textOf(node));
      if (/^h[23]$/.test(node.tagName)) {
        node.children.push({
          type: 'element',
          tagName: 'a',
          properties: {
            className: ['heading-anchor'],
            href: `#${String(props.id)}`,
            'aria-hidden': 'true',
            tabIndex: -1,
          },
          children: [{ type: 'text', value: '#' }],
        });
      }
    });
  };
}
