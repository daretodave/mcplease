// Edge handler for POST /api/links — the one place a link is created, and the ONLY place the Supabase
// service-role key is ever used. The browser cannot reach create_link (it is granted to the service role
// alone); a visitor proves they are human with Turnstile here, then the row is minted server-side and the
// response hands back the slug plus the RAW edit token exactly once. The database stores only the token's
// hash, so this single response is the only moment the token exists in the clear — lose it and it is gone.

import { createData, createServiceClient, type CreateLinkInput } from "@mcplease/data";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  TURNSTILE_SECRET_KEY: string;
}

// The JSON the create form POSTs. Which server field is required depends on the transport (an http link
// has no repo, a stdio link no server URL); blanks normalize to null before the row is written.
interface CreateBody {
  turnstileToken?: string;
  kind?: string;
  serverUrl?: string | null;
  repoUrl?: string | null;
  buildCmd?: string | null;
  runTarget?: string | null;
  name?: string | null;
  description?: string | null;
  tagline?: string | null;
  desiredSlug?: string | null;
}

const TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Collapse a missing or blank string to null, so optional fields store as NULL and never as "". */
function blankToNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Per-field caps. These mirror the create_link table's CHECK constraints — the edge rejects early with a
// clean code, and the database enforces the same bounds on the token-authorized edit path the edge never
// sees, so neither create nor a later edit can write (and amplify on read) an unbounded blob.
const LIMITS = {
  name: 80,
  description: 280,
  tagline: 70,
  serverUrl: 2048,
  repoUrl: 2048,
  buildCmd: 500,
  runTarget: 500,
} as const;

/** A present value that overruns its cap. */
function tooLong(value: string | null, max: number): boolean {
  return value !== null && value.length > max;
}

/** Does this parse as an http(s) URL? Blocks `javascript:` / `data:` and other schemes from being stored
 *  and later rendered as a link. */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Ask Cloudflare, with the secret, whether this Turnstile token is genuine. Any failure reads as "no". */
async function turnstileOk(secret: string, token: string, ip: string | null): Promise<boolean> {
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set("remoteip", ip);
  try {
    const res = await fetch(TURNSTILE_VERIFY, { method: "POST", body: form });
    const data = await res.json<{ success?: boolean }>();
    return data.success === true;
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { error: "bad_request" });
  }
  // A literal `null` (or any non-object) is valid JSON but has no fields — reject it before we read any.
  if (raw === null || typeof raw !== "object") {
    return json(400, { error: "bad_request" });
  }
  const body = raw as CreateBody;

  // Human check first — no bot ever reaches create_link.
  const token = blankToNull(body.turnstileToken);
  if (!token) return json(400, { error: "turnstile_missing" });
  const ip = request.headers.get("cf-connecting-ip");
  if (!(await turnstileOk(env.TURNSTILE_SECRET_KEY, token, ip))) {
    return json(403, { error: "turnstile_failed" });
  }

  // The transport decides which server field must be present; mirror the form's gate at the edge so a
  // crafted request can't write a half-formed link.
  const kind = body.kind;
  if (kind !== "http" && kind !== "stdio") return json(422, { error: "invalid_kind" });
  const serverUrl = blankToNull(body.serverUrl);
  const repoUrl = blankToNull(body.repoUrl);
  if (kind === "http" && !serverUrl) return json(422, { error: "missing_server_url" });
  if (kind === "stdio" && !repoUrl) return json(422, { error: "missing_repo_url" });

  const buildCmd = blankToNull(body.buildCmd);
  const runTarget = blankToNull(body.runTarget);
  const name = blankToNull(body.name);
  const description = blankToNull(body.description);
  const tagline = blankToNull(body.tagline);

  // Bound every stored field so a crafted request can't write megabytes (the realtime form already caps
  // these; this is the guard for everything that doesn't come through it).
  if (
    tooLong(serverUrl, LIMITS.serverUrl) ||
    tooLong(repoUrl, LIMITS.repoUrl) ||
    tooLong(buildCmd, LIMITS.buildCmd) ||
    tooLong(runTarget, LIMITS.runTarget) ||
    tooLong(name, LIMITS.name) ||
    tooLong(description, LIMITS.description) ||
    tooLong(tagline, LIMITS.tagline)
  ) {
    return json(422, { error: "field_too_long" });
  }
  // The server URL is an HTTP MCP endpoint — require an http(s) scheme so a non-URL is never stored.
  if (serverUrl && !isHttpUrl(serverUrl)) return json(422, { error: "invalid_server_url" });

  const input: CreateLinkInput = {
    desiredSlug: blankToNull(body.desiredSlug),
    kind,
    serverUrl,
    repoUrl,
    buildCmd,
    runTarget,
    name,
    description,
    tagline,
  };

  const data = createData(createServiceClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY));
  try {
    const { slug, editToken } = await data.links.create(input);
    const editUrl = new URL(`/e/${editToken}`, request.url).toString();
    return json(200, { slug, editUrl });
  } catch (err) {
    // The database is the final arbiter of slug validity + uniqueness; surface its verdict without
    // leaking internals. A taken slug is the race a realtime check can still lose.
    const message = err instanceof Error ? err.message : "";
    if (/slug taken/i.test(message)) return json(409, { error: "slug_taken" });
    if (/invalid slug/i.test(message)) return json(422, { error: "invalid_slug" });
    if (/invalid kind/i.test(message)) return json(422, { error: "invalid_kind" });
    return json(500, { error: "create_failed" });
  }
};
