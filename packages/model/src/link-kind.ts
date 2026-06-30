// The two transports a link can describe — a remote `http` server or a local `stdio` one — as a
// runtime tuple + its derived type, plus the narrowing guard. This is the ONE place the kind vocabulary
// lives, so the create radio, the seam, and the share page all agree; the DB `kind` check constraint
// mirrors this set.

/** The transports, in their canonical order (http is the default). */
export const LINK_KINDS = ["http", "stdio"] as const;

/** A link's transport. */
export type LinkKind = (typeof LINK_KINDS)[number];

/** Narrow an arbitrary string to a known link kind. */
export function isLinkKind(value: string): value is LinkKind {
  return (LINK_KINDS as readonly string[]).includes(value);
}
