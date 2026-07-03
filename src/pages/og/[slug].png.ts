import type { APIContext } from 'astro';
import { renderOgPng } from '../../lib/og';
import { getPublishedEssays, type Essay } from '../../lib/essays';

export async function getStaticPaths() {
  const essays = await getPublishedEssays();
  return essays.map((essay) => ({ params: { slug: essay.id }, props: { essay } }));
}

export async function GET({ props }: APIContext<{ essay: Essay }>) {
  const png = await renderOgPng(props.essay.data.title);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
