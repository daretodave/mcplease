// Pure share-meta builder the edge functions read. The Pages Functions are the thin IO
// seam (fetch the link, inject the head); the decision logic lives here, unit-gated and renderer-
// agnostic, so the same rules drive the <head> injection and (later) the OG image text.

/** The fields the edge fetches for a link (a subset of the public projection). */
export interface ShareMetaInput {
  name: string | null;
  tagline: string | null;
  description: string | null;
}

/** The <head> meta the edge injects into the SPA shell. */
export interface ShareMeta {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
}

const BRAND = "mcplease";
const DEFAULT_TITLE = "Connect to an MCP server";
const DEFAULT_DESCRIPTION =
  "Pick your client and connect in a click — image-driven setup for any MCP server.";

/**
 * Build the per-slug <head> meta. A null link (unknown or soft-deleted slug) yields a neutral
 * "not found" card, never a broken unfurl. `origin` carries no trailing slash.
 */
export function buildShareMeta(
  link: ShareMetaInput | null,
  slug: string,
  origin: string,
): ShareMeta {
  const url = `${origin}/${slug}`;
  if (!link) {
    return {
      title: `Link not found · ${BRAND}`,
      description: "This mcplease link doesn't exist (or was removed). Create one at mcplease.io.",
      image: `${origin}/og-default.png`,
      imageAlt: `${BRAND} — share an MCP server as a link`,
      url,
    };
  }
  const name = link.name?.trim() || null;
  const tagline = link.tagline?.trim() || null;
  const description = link.description?.trim() || tagline || DEFAULT_DESCRIPTION;
  return {
    title: name ? `${name} · ${BRAND}` : `${DEFAULT_TITLE} · ${BRAND}`,
    description,
    image: `${origin}/og/${slug}.png`,
    imageAlt: name ? `Connect to ${name}` : DEFAULT_TITLE,
    url,
  };
}
