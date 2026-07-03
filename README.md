# The Reducing Valve — platform

The site platform behind [thereducingvalve.com](https://thereducingvalve.com):
an Astro static site built for publications that take both their readers
seriously — the human ones and their machines.

**Content is not in this repository.** Essays are CC BY-NC 4.0 prose and live
outside the platform; this repo carries MIT-licensed code plus one sample
essay as a build fixture. The separation is deliberate: the publication's
manifesto points toward an open interface any publication can adopt, so the
platform stays content-agnostic.

## What it does

- **Long-form first** — a design-token system (`src/styles/tokens.css`) tuned
  for essay reading: ~20px serif body, 66ch measure, generous leading. Dark
  navy is home; Spectral / Instrument Sans / IBM Plex Mono, all self-hosted.
- **Two audiences** — every essay ships as semantic HTML (readable with JS
  off) *and* machine-readably: full-text RSS, Atom, and JSON Feed (with word
  and token-count facets), JSON-LD Article data, `llms.txt`, and a robots.txt
  that welcomes AI crawlers by name. The posture is documented at `/openness`.
- **OG images at build time** — satori + resvg render a 1200×630 frame per
  essay (paper ground, title slot, no-title fallback). No headless browser.
- **No tracking, no ranking** — no cookies, no popularity sorts, chronological
  only. Email capture posts to Buttondown (double opt-in).
- **Zero client JavaScript** on every page.

## Use it

```sh
npm install
npm run dev        # localhost:4321
npm run build      # static build → dist/
npm run preview    # serve dist/
```

Essays are markdown files in `src/content/essays/` (see the sample for the
frontmatter shape). Site identity — name, tagline, author, socials, list
provider — is centralized in `src/consts.ts`.

Deploys are a deliberate act, not a git hook: build locally, then
`npx wrangler pages deploy dist` (Cloudflare Pages direct upload), or point
any static host at `dist/`.

## Coming

A structured content API, an MCP endpoint for reading agents, and Ed25519
provenance signing at build time. Placeholders are already reserved in the
essay colophon and feed output (`signed: false`).

## License

Code is [MIT](LICENSE). Essays published at thereducingvalve.com are licensed
separately (CC BY-NC 4.0 unless noted per essay).
