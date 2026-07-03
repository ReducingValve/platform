/**
 * Essay-body directives, rendered from plain markdown so feeds and counts
 * can strip them cheaply (see lib/feed.ts and lib/essays.ts):
 *
 * - ![alt](./img.png "Caption")          → <figure><img/><figcaption>
 * - ![alt](./img.png "Caption | wide")   → …<figure class="wide"> (breakout)
 * - [pull] A sentence from the essay.    → offset pull-quote figure
 *
 * If the essay frontmatter carries `figures[basename]` (or `figures.cover`
 * for the banner, handled in the page template), the figcaption gains a
 * credit disclosure — summary shows the credit, expanding reveals the
 * generation prompt, which is also set as the img title for hover.
 */
import type { Root, Element, ElementContent } from 'hast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

interface FigureMeta {
  credit: string;
  prompt?: string;
}

function text(value: string): ElementContent {
  return { type: 'text', value };
}

function el(tagName: string, properties: Record<string, unknown>, children: ElementContent[]): Element {
  return { type: 'element', tagName, properties, children };
}

function creditDisclosure(meta: FigureMeta): Element {
  if (!meta.prompt) {
    return el('span', { className: ['fig-credit'] }, [text(meta.credit)]);
  }
  return el('details', { className: ['fig-gen'] }, [
    el('summary', {}, [text(`${meta.credit} — prompt`)]),
    el('p', { className: ['fig-prompt'] }, [text(meta.prompt)]),
  ]);
}

export default function rehypeFigure() {
  return (tree: Root, file: VFile) => {
    const frontmatter = (file.data as any)?.astro?.frontmatter ?? {};
    const figures: Record<string, FigureMeta> = frontmatter.figures ?? {};

    visit(tree, 'element', (node: Element, index, parent) => {
      if (!parent || index === undefined || node.tagName !== 'p') return;

      const meaningful = node.children.filter(
        (c) => !(c.type === 'text' && c.value.trim() === ''),
      );

      // --- [pull] directive → offset pull-quote ---
      const first = node.children[0];
      if (first?.type === 'text' && first.value.trimStart().startsWith('[pull]')) {
        const quote = first.value.trimStart().slice('[pull]'.length).trim();
        parent.children[index] = el('figure', { className: ['pullquote', 'offset'] }, [
          el('span', { className: ['tick'], 'aria-hidden': 'true' }, []),
          el('blockquote', {}, [text(quote), ...node.children.slice(1)]),
        ]);
        return;
      }

      // --- image paragraph → figure ---
      if (meaningful.length !== 1) return;
      const img = meaningful[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;

      const title = img.properties?.title;
      if (typeof title !== 'string' || title.trim() === '') return;
      delete img.properties.title;

      const parts = title.split('|').map((p) => p.trim());
      const caption = parts[0];
      const wide = parts.slice(1).includes('wide');

      const src = String(img.properties?.src ?? '');
      const basename = src.split('/').pop()?.replace(/\.[a-z0-9]+$/i, '') ?? '';
      // cover art reused in the body inherits its 'cover' provenance entry
      const meta = figures[basename] ?? (basename === 'banner' ? figures.cover : undefined);
      if (meta?.prompt) img.properties.title = meta.prompt; // hover reveals the prompt

      const figcaptionChildren: ElementContent[] = [
        el('span', { className: ['fig-cap'] }, [text(caption)]),
      ];
      if (meta) figcaptionChildren.push(creditDisclosure(meta));

      parent.children[index] = el('figure', wide ? { className: ['wide'] } : {}, [
        img as ElementContent,
        el('figcaption', {}, figcaptionChildren),
      ]);
    });
  };
}
