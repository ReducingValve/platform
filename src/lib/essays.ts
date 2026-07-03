import { getCollection, type CollectionEntry } from 'astro:content';

export type Essay = CollectionEntry<'essays'>;

/** Published essays, newest first. Chronological is the only order (PLAN §4c). */
export async function getPublishedEssays(): Promise<Essay[]> {
  const essays = await getCollection('essays', ({ data }) => !data.draft);
  return essays.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export interface Length {
  words: number;
  /** Rough LLM-token estimate (~4/3 tokens per word); a facet, not a promise. */
  tokens: number;
  minutes: number;
}

export function measure(body: string): Length {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return {
    words,
    tokens: Math.round((words * 4) / 3),
    minutes: Math.max(1, Math.round(words / 230)),
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function essayPath(essay: Essay): string {
  return `/essays/${essay.id}`;
}
