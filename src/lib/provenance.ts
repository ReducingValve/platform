/**
 * Build-time Ed25519 provenance (PLAN §4d, Phase 3).
 *
 * Canonical payload v1 — the exact string that is signed:
 *
 *   reducing-valve provenance v1
 *   canonical: <canonical URL>
 *   title: <title>
 *   author: <accountable principal>
 *   date: <YYYY-MM-DD>
 *   sha256: <hex SHA-256 of the UTF-8 prose-only body markdown>
 *
 * The private key lives outside the site tree (keys/rv_ed25519_private.pem
 * at the repo root, gitignored). If it is absent the build still succeeds
 * and marks essays unsigned — signing is a property of the author's machine,
 * not of the code.
 */
import { createHash, createPrivateKey, sign as edSign } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Essay } from './essays';
import { proseOnly } from './feed';
import { canonicalUrl } from './feed';
import { AUTHOR } from '../consts';

/** Raw Ed25519 public key, hex. Public by design; the pair's private half never leaves the author's machine. */
export const PUBLIC_KEY_HEX = '5b8890c2ad258d78026213bb29be2264b52050bbdeb7c048f9a4b39a38c2b6be';

const PRIVATE_KEY_PATH = path.resolve(process.cwd(), '../keys/rv_ed25519_private.pem');

export interface Provenance {
  version: 'reducing-valve provenance v1';
  public_key_ed25519: string;
  body_sha256: string;
  payload: string;
  signature: string | null;
  signed: boolean;
  composition: string;
  accountable: string;
}

export function provenanceFor(essay: Essay): Provenance {
  const body = proseOnly(essay.body ?? '');
  const bodySha = createHash('sha256').update(body, 'utf-8').digest('hex');
  const payload = [
    'reducing-valve provenance v1',
    `canonical: ${canonicalUrl(essay)}`,
    `title: ${essay.data.title}`,
    `author: ${AUTHOR}`,
    `date: ${essay.data.date.toISOString().slice(0, 10)}`,
    `sha256: ${bodySha}`,
  ].join('\n');

  let signature: string | null = null;
  if (existsSync(PRIVATE_KEY_PATH)) {
    const key = createPrivateKey(readFileSync(PRIVATE_KEY_PATH));
    signature = edSign(null, Buffer.from(payload, 'utf-8'), key).toString('hex');
  }

  return {
    version: 'reducing-valve provenance v1',
    public_key_ed25519: PUBLIC_KEY_HEX,
    body_sha256: bodySha,
    payload,
    signature,
    signed: signature !== null,
    composition: essay.data.composition,
    accountable: AUTHOR,
  };
}

export const shortKey = `${PUBLIC_KEY_HEX.slice(0, 8)}…${PUBLIC_KEY_HEX.slice(-8)}`;
