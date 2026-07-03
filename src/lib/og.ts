/**
 * OG-image template, 1200×630 — glyph, a slot for an essay title, tagline
 * strip along the base. Paper ground: the handoff's hard constraints assign
 * the paper/light lockup variant to OG images (dark stays home elsewhere).
 * All type set as type (satori), no text baked into imagery.
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const NAVY = '#101D2E';
const PAPER = '#F4EFE6';
const AMBER = '#E3A244';
const DIM = 'rgba(16, 29, 46, 0.62)';
const FAINT = 'rgba(16, 29, 46, 0.52)';

const fontDir = path.resolve(process.cwd(), 'src/assets/og-fonts');

async function loadFonts() {
  const [spectral500, spectralItalic, instrument500, plexMono] = await Promise.all([
    readFile(path.join(fontDir, 'spectral-500.ttf')),
    readFile(path.join(fontDir, 'spectral-400-italic.ttf')),
    readFile(path.join(fontDir, 'instrument-sans-500.ttf')),
    readFile(path.join(fontDir, 'ibm-plex-mono-400.ttf')),
  ]);
  return [
    { name: 'Spectral', data: spectral500, weight: 500 as const, style: 'normal' as const },
    { name: 'Spectral', data: spectralItalic, weight: 400 as const, style: 'italic' as const },
    { name: 'Instrument Sans', data: instrument500, weight: 500 as const, style: 'normal' as const },
    { name: 'IBM Plex Mono', data: plexMono, weight: 400 as const, style: 'normal' as const },
  ];
}

function glyphImg(width: number, stroke = 3) {
  const height = Math.round((width * 44) / 84);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 44" fill="none">` +
    `<path d="M36 22 H80" stroke="${AMBER}" stroke-width="${stroke}" stroke-linecap="round"/>` +
    `<path d="M6 7 L36 22 M6 37 L36 22" stroke="${NAVY}" stroke-width="${stroke}" stroke-linecap="round"/>` +
    `</svg>`;
  return {
    type: 'img',
    props: {
      src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      width,
      height,
    },
  };
}

const taglineStrip = {
  type: 'div',
  props: {
    style: {
      fontFamily: 'Instrument Sans',
      fontSize: 21,
      letterSpacing: 8,
      color: DIM,
    },
    children: 'AGENTS · MARKETS · ATTENTION',
  },
};

function essayFrame(title: string) {
  const size = title.length > 70 ? 52 : title.length > 42 ? 58 : 66;
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: PAPER,
        padding: 72,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 34 },
            children: [
              glyphImg(102, 3.5),
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Instrument Sans',
                    fontSize: 20,
                    letterSpacing: 7,
                    color: FAINT,
                  },
                  children: 'THE REDUCING VALVE',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Spectral',
              fontWeight: 500,
              fontSize: size,
              lineHeight: 1.15,
              color: NAVY,
              maxWidth: 1010,
              letterSpacing: -0.5,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              width: '100%',
            },
            children: [
              taglineStrip,
              {
                type: 'div',
                props: {
                  style: { fontFamily: 'IBM Plex Mono', fontSize: 20, color: FAINT },
                  children: 'thereducingvalve.com',
                },
              },
            ],
          },
        },
      ],
    },
  };
}

/** No-title fallback: centered lockup over the tagline strip. */
function fallbackFrame() {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: PAPER,
        gap: 44,
      },
      children: [
        glyphImg(150, 3),
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'baseline',
              gap: 20,
              fontFamily: 'Spectral',
              fontSize: 76,
              color: NAVY,
              letterSpacing: -0.5,
            },
            children: [
              {
                type: 'div',
                props: { style: { fontStyle: 'italic', fontWeight: 400 }, children: 'The' },
              },
              { type: 'div', props: { style: { fontWeight: 500 }, children: 'Reducing Valve' } },
            ],
          },
        },
        taglineStrip,
      ],
    },
  };
}

export async function renderOgPng(title?: string): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const svg = await satori((title ? essayFrame(title) : fallbackFrame()) as any, {
    width: 1200,
    height: 630,
    fonts,
  });
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
