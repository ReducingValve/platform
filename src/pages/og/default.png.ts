import { renderOgPng } from '../../lib/og';

export async function GET() {
  const png = await renderOgPng();
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
}
