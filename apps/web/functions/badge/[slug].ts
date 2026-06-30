// Edge handler for /badge/<slug>.svg — the embeddable README shield. A hand-templated, shields-style SVG
// (no Satori needed), edge-cached. An author drops it in their README wrapped in a link to /<slug>, so the
// badge itself carries no link. Three variants share one two-segment shield (left = brand mark + "MCP"):
//   • connect (default, accent) — "Connect to MCP"
//   • info (?variant=info, neutral) — "<name> · <transport>", read from the link
//   • notFound (neutral) — served automatically when the slug no longer resolves, so a removed link
//     degrades to an honest shield instead of a broken image.
// The read uses the anon key against the public RPC; a read blip serves the optimistic connect shield
// rather than flashing "link not found" in someone's README.

import { createBrowserClient, createData } from "@mcplease/data";
import type { PublicLink } from "@mcplease/model";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

const DARK = "#2b2f3a"; // left segment
const ACCENT = "#7a55f5"; // connect — the brand accent
const NEUTRAL = "#4b4f58"; // info / not-found
const INK = "#ffffff";

const LEFT_W = 56; // mark + "MCP"
const LEFT_TEXT_X = 38;
const CHAR_W = 6.6; // ~per-char advance at 11px Verdana
const RIGHT_PAD = 20;

/** Escape XML text content (`&`, `<`, `>`). */
function escText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Escape an XML attribute value (text plus quotes). */
function escAttr(value: string): string {
  return escText(value).replace(/"/g, "&quot;");
}

/** Trim a long name so the shield stays a shield. */
function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

// The brand mark (speech bubble + "yes" check) scaled into the left segment.
const MARK =
  `<g transform="translate(7 3.1) scale(0.42)">` +
  `<rect x="3" y="3" width="26" height="19.5" rx="7.5" fill="${ACCENT}"/>` +
  `<path d="M9.6 21 L9.1 27.5 A0.55 0.55 0 0 0 10 27.9 L15.8 22 Z" fill="${ACCENT}"/>` +
  `<path d="M10.6 13.2 L14 16.7 L21.2 9.2" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>` +
  `</g>`;

/** Build the two-segment shield for a right-hand label + colour. */
function shield(rightText: string, rightColor: string): string {
  const rightW = Math.ceil(rightText.length * CHAR_W) + RIGHT_PAD;
  const w = LEFT_W + rightW;
  const rightTextX = LEFT_W + rightW / 2;
  const aria = `MCP: ${rightText}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${escAttr(aria)}">
  <title>${escText(aria)}</title>
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <clipPath id="r"><rect width="${w}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${LEFT_W}" height="20" fill="${DARK}"/>
    <rect x="${LEFT_W}" width="${rightW}" height="20" fill="${rightColor}"/>
    <rect width="${w}" height="20" fill="url(#s)"/>
  </g>
  ${MARK}
  <g fill="${INK}" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${LEFT_TEXT_X}" y="15" fill="#010101" fill-opacity=".3">MCP</text>
    <text x="${LEFT_TEXT_X}" y="14">MCP</text>
    <text x="${rightTextX}" y="15" fill="#010101" fill-opacity=".3">${escText(rightText)}</text>
    <text x="${rightTextX}" y="14">${escText(rightText)}</text>
  </g>
</svg>`;
}

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

/** The info shield's right label: the link's name (or slug) and its transport. */
function infoLabel(link: PublicLink, slug: string): string {
  return `${truncate(link.name?.trim() || slug, 22)} · ${link.kind}`;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = String(params.slug).replace(/\.svg$/, "");
  const variant = new URL(request.url).searchParams.get("variant");

  try {
    const data = createData(createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));
    const link = await data.links.getPublic(slug);
    if (!link) return svgResponse(shield("link not found", NEUTRAL));
    if (variant === "info") return svgResponse(shield(infoLabel(link, slug), NEUTRAL));
    return svgResponse(shield("Connect to MCP", ACCENT));
  } catch {
    // A read blip shouldn't flash "link not found" in a README — stay optimistic.
    return svgResponse(shield("Connect to MCP", ACCENT));
  }
};
