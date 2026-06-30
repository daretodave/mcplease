# mcplease

**Share your MCP server as a link.** Paste your MCP server, get `mcplease.io/<slug>` — a page that shows whoever opens it exactly how to connect from *their* client (Claude Code, Claude Desktop, ChatGPT, Cursor, VS Code, Windsurf, and more), with image-driven steps, copy-paste commands, and one-click install where the client supports it.

> No directory. No account. Just the easiest way to hand someone your MCP server.

## Why

Connecting an MCP server today means the author hand-writes a setup matrix — a different ritual per client (`claude mcp add …`, a JSON blob keyed `url` here and `serverUrl` there, a GUI click-path elsewhere, OAuth somewhere in the middle). A big company can afford to publish and maintain that page. Most authors just paste a bare URL into a README and hope the reader figures out their own client.

**mcplease generates that page for any server, from one paste** — and hands you a README badge to advertise it.

## How it works

1. Paste your MCP server — a remote **HTTP** URL, or a local **stdio** server (clone → build → run).
2. Get a shareable link `mcplease.io/<slug>` (plus a one-time edit link — no account).
3. Whoever opens it picks their client and follows image-driven, copy-paste steps — or clicks **Add** where supported.
4. Drop the **README badge** in your repo so anyone can connect in one click.

## Status

🚧 **Building in the open** — early and under active construction.

## Stack

- **Web** — React 19 + Vite + `react-router-dom`, Zustand, PandaCSS; a static SPA on **Cloudflare Pages**.
- **Edge** — Cloudflare Pages Functions (per-link meta injection, the OG image, the README badge, the create endpoint).
- **Data** — Supabase Postgres: one `links` table behind `SECURITY DEFINER` RPCs.
- **Anti-abuse** — Cloudflare Turnstile. **Analytics** — GA4, anonymous.

## Development

An npm-workspaces monorepo (Node 20). Internal packages export TypeScript source directly — no build step.

```bash
npm install      # also wires git hooks (lefthook) + generates the Panda styled-system
npm run dev      # the web app at apps/web
npm test         # vitest with per-package coverage gates
npm run e2e      # Playwright, hermetic, against the production bundle
npm run build    # tsc + vite build → apps/web/dist
```

The whole CI gate runs locally too: `npm run typecheck`, `npm run lint`, `npm run format:check`,
`npm run test:structure` (the co-located test law), `npm run test:agnostic-seam`. Conventions for working
in the tree live in [CLAUDE.md](./CLAUDE.md).

## License

[MIT](./LICENSE) — no strings.
