import { marked } from 'marked';
import type { Essay } from './essays';
import { SITE_URL } from '../consts';

/** Full essay body as HTML — feeds are never truncated (PLAN §4b). */
export async function essayHtml(essay: Essay): Promise<string> {
  return await marked.parse(essay.body ?? '');
}

export function essayText(essay: Essay): string {
  // Strip the little markdown the essays use; feeds carry plain prose.
  return (essay.body ?? '')
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
