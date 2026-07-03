import { marked } from 'marked';
import type { Essay } from './essays';
import { SITE_URL } from '../consts';

/** Presentation directives stay on the page: pull-quotes repeat body lines
 *  and figure paths are build-relative, so feeds drop both. Prose is never
 *  truncated (PLAN §4b). */
export function proseOnly(body: string): string {
  return body
    .replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '')
    .replace(/^\[pull\][^\n]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Full essay body as HTML — feeds are never truncated (PLAN §4b). */
export async function essayHtml(essay: Essay): Promise<string> {
  return await marked.parse(proseOnly(essay.body ?? ''));
}

export function essayText(essay: Essay): string {
  // Strip the little markdown the essays use; feeds carry plain prose.
  return proseOnly(essay.body ?? '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

export function canonicalUrl(essay: Essay): string {
  return `${SITE_URL}/essays/${essay.id}`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
