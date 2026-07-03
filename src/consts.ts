// Locked copy lives in reducing-valve-identity-kit.md — do not rephrase here.

export const SITE_URL = 'https://thereducingvalve.com';
export const SITE_NAME = 'The Reducing Valve';

/** Locked bio/tagline sentence — use verbatim wherever a description appears. */
export const SITE_DESCRIPTION =
  'Essays on agents, markets, and attention. An independent magazine, published when there’s something to add.';

/** Banner strip, locked — the literal string, so the text layer that
 *  agents and copy-paste receive matches the visual layer. */
export const TAGLINE_STRIP = 'AGENTS · MARKETS · ATTENTION';

/** Footer identity line — the broadened voice; the locked bio sentence
 *  stays for meta descriptions and social bios. */
export const FOOTER_LINE =
  'An independent magazine, written facing forward — published when there is something worth saying.';

export const AUTHOR = 'Barnaba Barcellona';
export const CONTACT_EMAIL = 'hello@thereducingvalve.com';

export const SOCIALS = [
  { label: 'X', href: 'https://x.com/readthevalve' },
  { label: 'Bluesky', href: 'https://bsky.app/profile/thereducingvalve.com' },
  { label: 'GitHub', href: 'https://github.com/ReducingValve' },
];

/**
 * Buttondown handles the email list (double opt-in is its default).
 * The form posts to buttondown.com/api/emails/embed-subscribe/<username>.
 */
export const BUTTONDOWN_USERNAME = 'reducingvalve';

/** MCP endpoint (Cloudflare Worker on the zone route /mcp*; source in the
 *  platform repo, workers/mcp). */
export const MCP_URL = 'https://thereducingvalve.com/mcp';

/** Default essay license until the CC BY / BY-NC decision is made (PLAN §4b). */
export const LICENSE = {
  label: 'CC BY-NC 4.0',
  url: 'https://creativecommons.org/licenses/by-nc/4.0/',
};
