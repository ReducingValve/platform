/**
 * The Reducing Valve — MCP endpoint (PLAN §Phase 3).
 *
 * A stateless MCP server over streamable HTTP: plain JSON-RPC 2.0 on
 * POST /mcp, no sessions, no dependencies. It is a thin door onto the
 * publication's static content API — the worker holds no content and
 * keeps no logs of what your agent reads (manifesto commitment 5).
 */

const SITE = 'https://thereducingvalve.com';
const PROTOCOL_VERSION = '2025-03-26';

const SERVER_INFO = { name: 'the-reducing-valve', version: '1.0.0' };

const INSTRUCTIONS = `Essays on agents, markets, and attention — an independent
magazine, published when there's something to add. Every essay is Ed25519-signed;
verification instructions: ${SITE}/openness#verification. list_essays for the
index, get_essay for full text, search_essays for full-text lookup.`;

const TOOLS = [
  {
    name: 'list_essays',
    description:
      'List all published essays, newest first (chronological is the only order): id, title, abstract, date, tags, length in words and tokens, signature status, and the URLs of the html/markdown/json editions.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_essay',
    description:
      'Fetch one essay by id/slug: full text (markdown and plain), metadata, license, and the Ed25519 provenance record (signed payload + signature, verifiable against the publication key).',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: "Essay id, e.g. 'thought-metered'" },
      },
      required: ['slug'],
      additionalProperties: false,
    },
  },
  {
    name: 'search_essays',
    description:
      'Full-text search across all essays. Returns matching essays with surrounding snippets, ranked by term frequency — properties of content, never popularity.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Words to look for' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version',
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });

const rpcResult = (id, result) => json({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => json({ jsonrpc: '2.0', id, error: { code, message } });

const textContent = (value, isError = false) => ({
  content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
  isError,
});

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'reducing-valve-mcp' } });
  if (!res.ok) return null;
  return res.json();
}

async function callTool(name, args) {
  if (name === 'list_essays') {
    const index = await fetchJson(`${SITE}/api/essays.json`);
    if (!index) return textContent('The content API is unreachable right now.', true);
    return textContent(index);
  }

  if (name === 'get_essay') {
    const slug = String(args?.slug ?? '').replace(/[^a-z0-9-]/gi, '');
    if (!slug) return textContent('A slug is required.', true);
    const essay = await fetchJson(`${SITE}/essays/${slug}.json`);
    if (!essay) return textContent(`No essay '${slug}'. Try list_essays for valid ids.`, true);
    return textContent(essay);
  }

  if (name === 'search_essays') {
    const query = String(args?.query ?? '').trim().toLowerCase();
    if (!query) return textContent('A query is required.', true);
    const terms = query.split(/\s+/).filter(Boolean);
    const index = await fetchJson(`${SITE}/api/essays.json`);
    if (!index) return textContent('The content API is unreachable right now.', true);

    const results = [];
    for (const item of index.essays) {
      const essay = await fetchJson(item.urls.json);
      if (!essay) continue;
      const haystack = `${essay.title}\n${essay.abstract}\n${essay.body_text}`.toLowerCase();
      let score = 0;
      const snippets = [];
      for (const term of terms) {
        let at = haystack.indexOf(term);
        while (at !== -1) {
          score++;
          if (snippets.length < 3) {
            const from = Math.max(0, at - 120);
            snippets.push('…' + essay.body_text.slice(from, at + term.length + 120).replace(/\s+/g, ' ') + '…');
          }
          at = haystack.indexOf(term, at + term.length);
        }
      }
      if (score > 0) {
        results.push({
          id: essay.id,
          title: essay.title,
          abstract: essay.abstract,
          date_published: essay.date_published,
          matches: score,
          snippets,
          urls: essay.urls,
        });
      }
    }
    results.sort((a, b) => b.matches - a.matches);
    return textContent({ query, count: results.length, results });
  }

  return textContent(`Unknown tool '${name}'.`, true);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (request.method === 'GET') {
      return new Response(
        `The Reducing Valve — MCP endpoint.\nPOST JSON-RPC 2.0 to /mcp (streamable HTTP, stateless).\nTools: list_essays, get_essay, search_essays.\nEvery door: ${SITE}/openness\n`,
        { headers: { 'Content-Type': 'text/plain; charset=utf-8', ...CORS } },
      );
    }

    if (request.method !== 'POST' || (url.pathname !== '/mcp' && url.pathname !== '/'))
      return new Response('Not found', { status: 404, headers: CORS });

    let msg;
    try {
      msg = await request.json();
    } catch {
      return rpcError(null, -32700, 'Parse error');
    }
    if (Array.isArray(msg)) return rpcError(null, -32600, 'Batch requests are not supported');

    const { id, method, params } = msg ?? {};

    // notifications get an empty 202
    if (id === undefined || id === null) return new Response(null, { status: 202, headers: CORS });

    switch (method) {
      case 'initialize':
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
          instructions: INSTRUCTIONS,
        });
      case 'ping':
        return rpcResult(id, {});
      case 'tools/list':
        return rpcResult(id, { tools: TOOLS });
      case 'tools/call':
        try {
          return rpcResult(id, await callTool(params?.name, params?.arguments));
        } catch (err) {
          return rpcResult(id, textContent(`Tool failed: ${err.message}`, true));
        }
      default:
        return rpcError(id, -32601, `Method not found: ${method}`);
    }
  },
};
