// The slug rules, in one pure place. The realtime availability check is advisory (debounced
// `slug_available`); the DB unique index on non-deleted rows is the real, race-proof arbiter. The DB
// create trigger mirrors `normalizeSlug`/the reserved set, so a slug minted here and a slug minted
// server-side agree.

/** Length bounds (inclusive). */
export const SLUG_MIN = 2;
export const SLUG_MAX = 40;

/**
 * Reserved slugs — names that collide with our own routes / edge paths, plus a short denylist of
 * confusing or brand-squatting claims. A `_`-prefixed slug is ALWAYS reserved (our internal
 * namespace), checked separately in `isReserved`. Lowercase, since a slug is lowercased before the
 * check.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // own routes / edge paths
  "e",
  "og",
  "api",
  "badge",
  "terms",
  "privacy",
  "assets",
  // short denylist — would confuse or squat
  "admin",
  "new",
  "create",
  "edit",
  "about",
  "help",
  "mcplease",
  "favicon",
  "robots",
  "sitemap",
]);

/** Why a slug is invalid — a stable enum the UI maps to a human message. `null` (from `slugProblem`)
 *  means valid. */
export type SlugProblem =
  | "empty"
  | "too-short"
  | "too-long"
  | "charset"
  | "dash-edge"
  | "double-dash"
  | "reserved";

/** Is this slug reserved? `_`-prefixed is our internal namespace and always reserved. */
export function isReserved(slug: string): boolean {
  return slug.startsWith("_") || RESERVED_SLUGS.has(slug);
}

/**
 * The first rule a slug breaks, or `null` when it satisfies them all. Checked in a deliberate order so
 * the UI message is the most useful one (an obviously-too-short claim reads as "too short", not
 * "reserved"). Expects an already-lowercased candidate — uppercase trips `charset`.
 */
export function slugProblem(slug: string): SlugProblem | null {
  if (slug.length === 0) return "empty";
  if (slug.length < SLUG_MIN) return "too-short";
  if (slug.length > SLUG_MAX) return "too-long";
  if (!/^[a-z0-9-]+$/.test(slug)) return "charset";
  if (slug.startsWith("-") || slug.endsWith("-")) return "dash-edge";
  if (slug.includes("--")) return "double-dash";
  if (isReserved(slug)) return "reserved";
  return null;
}

/** Convenience boolean over `slugProblem`. */
export function isValidSlug(slug: string): boolean {
  return slugProblem(slug) === null;
}

/**
 * Best-effort coercion of a free-typed claim toward a valid slug: lowercase, every run of non
 * `[a-z0-9]` becomes a single dash, edge dashes trimmed, clamped to `SLUG_MAX` (then any trailing
 * dash left by the clamp trimmed again). It does NOT enforce the reserved set or the min length — the
 * realtime check + the DB index do. Returns "" for input with no usable characters.
 */
export function normalizeSlug(input: string): string {
  const dashed = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return dashed.slice(0, SLUG_MAX).replace(/-+$/g, "");
}
