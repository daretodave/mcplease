# CLAUDE.md — working in the mcplease monorepo

**mcplease** turns one MCP server into a shareable connect page. Paste a server on `mcplease.io`, get
`mcplease.io/<slug>` — a page that shows whoever opens it how to connect from _their_ client. This file
is the build contract for anyone (human or agent) touching this repo. Every rule here is enforced by a
gate, not a reviewer's memory — so the fastest way to work _with_ the grain is to know it up front.

## The shape

An **npm workspaces** monorepo (`"type":"module"`, no turbo/pnpm/yarn — one lockfile, one toolchain).
Internal packages **export TypeScript source directly** (`"@mcplease/x": "*"`, `main`/`exports` → `src/`)
— no per-package build step, no `dist/` to drift.

- `apps/web` — the **Vite 5 + React 19** SPA + the Cloudflare **Pages Functions** (`functions/`).
- `packages/model` — DB types + the pure shapes both sides share. Names no vendor.
- `packages/data` — **the sealed Supabase seam** (see below).
- `packages/slug` — the slug rules (lowercase `[a-z0-9-]`, 2–40, no edge/double dash, reserved set).
- `packages/client-matrix` — the typed table of the connect targets (one row per client).
- `packages/analytics` — the typed GA4 event taxonomy (`track.*`).
- `packages/theme` — the agnostic design tokens + the PandaCSS preset.
- `scripts/` — the three house checkers (each a pure `violations()` + a thin runner).
- `supabase/` — `config.toml` + hand-written `migrations/` + `seed.sql` (the monorepo is the DB authority;
  CI applies migrations — locally for e2e, to the cloud project on deploy).

## The laws (each one is a gate)

1. **Tests are co-located.** `foo.ts` ships `foo.test.ts` _beside_ it — no `__tests__/`. `npm run
   test:structure` fails the build on a testable module without its neighbour. Assert **behavior, never
   snapshots**. Coverage gates live in each `vitest.config.ts`: **85%** for `apps/web` + `data` + `theme`,
   **95%** for the pure-logic packages (`slug`, `client-matrix`, `analytics`, `model`) and `scripts/`.
2. **One module names the vendor.** Only `@mcplease/data` imports `@supabase/supabase-js`. Everything else
   calls the domain API (`data.links.*`) — never a table name, never the vendor. Lint enforces it.
3. **State has three planes.** Client/UI → **Zustand** (`src/stores/`). Server data → **TanStack Query**.
   **React Context is lint-banned** (a re-render footgun) — reach for a store with a selector.
4. **Styling is PandaCSS with `strictTokens: true`** — a raw hex is a compile error. The agnostic token core
   (`packages/theme/src/{tokens,accents,motion}.ts`) emits structured values only (no `px`, no `rgba()`, no
   font stacks); the web CSS materialization lives in `preset.ts`. `npm run test:agnostic-seam` guards it.
5. **kebab-case files _and_ folders**, lint-enforced. A non-trivial component is a folder
   (`step-card/step-card.tsx` + its test + local helpers). Barrels only at a package's public entry.
6. **Analytics is a typed taxonomy.** Every event flows through `@mcplease/analytics` `track.*` — `snake_case`,
   surface-prefixed (`create_`/`share_`/`edit_`/`system_`), low-cardinality enum params only (never a server
   URL, never PII). Raw `dataLayer`/`gtag` is lint-banned outside the package.
7. **The service-role key lives in exactly one file** — the `functions/api/links.ts` create endpoint. The
   browser only ever holds the **anon** key, straight against the `SECURITY DEFINER` RPCs. Editing is gated
   by the unguessable UUID edit token, re-hashed and verified inside the RPC — there are **no accounts**.

## Commands

```
npm install            # also wires lefthook + runs panda codegen (prepare)
npm run dev            # the web app
npm run typecheck      # tsc --noEmit across the workspaces (+ the functions project)
npm run lint           # eslint . --max-warnings 0 (zero warnings; the seam/Context/dataLayer bans)
npm run format:check   # prettier --check
npm run test:structure # the co-located test law
npm run test:agnostic-seam
npm test               # vitest with coverage gates
npm run build          # tsc --noEmit && vite build  (then test:bundle-budget gates the gzip ceiling)
npm run e2e            # Playwright, hermetic vs a LOCAL supabase stack, no sleeps, retries:0
```

`lefthook` runs lint+format on **staged** files at pre-commit, and the whole-repo guards (typecheck, lint,
format, structure, agnostic-seam) at **pre-push** — pre-push is CI's mirror; keep them in lock-step.

## CI / deploy

GitHub Actions, Node 20 pinned. The gate fans out at t=0 — `build` (+ bundle-budget), `unit` (coverage),
`checks` (typecheck · lint · format · structure · agnostic-seam), `e2e` (a local supabase stack) — then a
serial tail on push to `main`: `migrate` (`supabase db push` to the cloud project) → `deploy` (wrangler
`pages deploy` of the gated artifact). Schema leads the app.

## Conventions

- **Exact pins** on the framework floor (React/`react-dom`) and the tooling — a range on a load-bearing dep
  is a bug; upgrade in a commit that says so.
- Migrations are **timestamped, hand-written, commented** SQL (`YYYYMMDDHHMMSS_snake_name.sql`). Generated
  types land in `packages/model/src/database.types.ts` (eslint-ignored).
- **No attribution footer** on commits — no `Co-Authored-By`, no "Generated with". MIT, no copyright line.
