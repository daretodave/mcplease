// Shared OG-card renderer for /og/<slug>.png and /og-default.png. Satori (via workers-og) turns an HTML
// string into a 1200×630 PNG at the edge — the share-unfurl card. The design is the brand OG template:
// a corner glow, a ghost mark, the lockup, an eyebrow + the link's tagline as the headline, then the URL
// and a connect shield. The font is workers-og's bundled Inter (no runtime font fetch). Underscore-prefixed,
// so Pages treats this as a shared module, not a route.

import { ImageResponse, loadGoogleFont } from "workers-og";

// Dark-theme brand hexes (the card is always dark), mirroring @mcplease/theme's tokens. Raw hex is fine at
// the edge — the strictTokens rule is a web-CSS concern, and Satori takes plain CSS, not design tokens.
const CANVAS = "#0B0D12";
const INK = "#F2F4F7";
const MUTED = "#9BA3AE";
const FAINT = "#6B7480";
const RAISED = "#1B1F26";
const ACCENT = "#7A55F5";
const ACCENT_TEXT = "#9B82FF";
const ACCENT_FG = "#FFFFFF";
const GLOW = "124, 92, 255"; // the accent glow (#7C5CFF), as rgb() channels for the radial gradient

const DEFAULT_HEADLINE = "Your MCP server, one paste away.";
const SUBTITLE = "Pick your client — follow the pictures. No accounts, ever.";

/** The brand mark (speech bubble + "yes" check) as an SVG string. */
function markSvg(size: number): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">` +
    `<rect x="3" y="3" width="26" height="19.5" rx="7.5" fill="${ACCENT}"/>` +
    `<path d="M9.6 21 L9.1 27.5 A0.55 0.55 0 0 0 10 27.9 L15.8 22 Z" fill="${ACCENT}"/>` +
    `<path d="M10.6 13.2 L14 16.7 L21.2 9.2" fill="none" stroke="${ACCENT_FG}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>`
  );
}

/** The mark as an <img> with a data URI — Satori renders inline SVG most reliably this way. */
function markImg(size: number, style = ""): string {
  return `<img width="${size}" height="${size}" style="${style}" src="data:image/svg+xml;base64,${btoa(markSvg(size))}" />`;
}

/** Escape HTML text so a name/tagline can't break the Satori parse. */
function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Scale the headline down as it gets longer, so a 70-char tagline and a one-word name both fit the frame. */
function headlineSize(text: string): number {
  if (text.length > 52) return 56;
  if (text.length > 34) return 70;
  return 90;
}

export interface OgCardInput {
  /** The big line — a link's tagline, its name, or the brand default. */
  headline: string;
  /** The slug for the footer URL; empty renders the bare `mcplease.io`. */
  slug: string;
}

/**
 * Build the Satori-ready HTML for the card. Satori is strict: every `<div>` with more than one child needs
 * an explicit `display:flex`, and inter-tag whitespace counts as a child — so this is assembled with flex on
 * every box and no whitespace between tags.
 */
export function ogCardHtml({ headline, slug }: OgCardInput): string {
  const line = headline.trim() || DEFAULT_HEADLINE;
  const url = slug ? `mcplease.io/${esc(slug)}` : "mcplease.io";
  return (
    `<div style="display:flex;flex-direction:column;justify-content:space-between;width:1200px;height:630px;padding:76px 80px;background:${CANVAS};font-family:'Space Grotesk';position:relative;">` +
    `<div style="display:flex;position:absolute;width:760px;height:760px;right:-180px;top:-300px;border-radius:760px;background:radial-gradient(circle, rgba(${GLOW},0.30), rgba(${GLOW},0) 62%);"></div>` +
    markImg(520, "position:absolute;right:-40px;bottom:-90px;opacity:0.07;") +
    `<div style="display:flex;align-items:center;">` +
    markImg(46, "margin-right:14px;") +
    `<div style="display:flex;font-size:36px;font-weight:600;letter-spacing:-0.02em;color:${INK};">mcplease</div>` +
    `</div>` +
    `<div style="display:flex;flex-direction:column;">` +
    `<div style="display:flex;font-family:'JetBrains Mono';font-size:20px;letter-spacing:0.14em;color:${ACCENT_TEXT};margin-bottom:18px;">CONNECT TO MCP</div>` +
    `<div style="display:flex;font-size:${headlineSize(line)}px;font-weight:600;letter-spacing:-0.03em;line-height:1.04;color:${INK};max-width:1040px;">${esc(line)}</div>` +
    `<div style="display:flex;font-size:33px;color:${MUTED};margin-top:28px;line-height:1.3;max-width:900px;">${SUBTITLE}</div>` +
    `</div>` +
    `<div style="display:flex;align-items:center;justify-content:space-between;">` +
    `<div style="display:flex;font-family:'JetBrains Mono';font-size:24px;color:${FAINT};">${url}</div>` +
    `<div style="display:flex;height:42px;border-radius:9px;overflow:hidden;font-size:19px;font-weight:600;">` +
    `<div style="display:flex;align-items:center;background:${RAISED};color:${INK};padding:0 16px;">` +
    markImg(22, "margin-right:8px;") +
    `<div style="display:flex;">MCP</div>` +
    `</div>` +
    `<div style="display:flex;align-items:center;background:${ACCENT};color:${ACCENT_FG};padding:0 16px;">Connect to MCP</div>` +
    `</div>` +
    `</div>` +
    `</div>`
  );
}

interface LoadedFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
}

// The brand faces (Space Grotesk for the wordmark/headline, JetBrains Mono for the eyebrow/url) fetched
// once per isolate and memoized, since the OG render is the only consumer and the font bytes don't change.
// A fetch failure falls back to workers-og's bundled font rather than failing the image — and isn't cached,
// so a later request retries.
let fontCache: LoadedFont[] | null = null;

async function loadFonts(): Promise<LoadedFont[] | null> {
  if (fontCache) return fontCache;
  try {
    const [grotesk, groteskBold, mono] = await Promise.all([
      loadGoogleFont({ family: "Space Grotesk", weight: 400 }),
      loadGoogleFont({ family: "Space Grotesk", weight: 600 }),
      loadGoogleFont({ family: "JetBrains Mono", weight: 400 }),
    ]);
    fontCache = [
      { name: "Space Grotesk", data: grotesk, weight: 400, style: "normal" },
      { name: "Space Grotesk", data: groteskBold, weight: 600, style: "normal" },
      { name: "JetBrains Mono", data: mono, weight: 400, style: "normal" },
    ];
    return fontCache;
  } catch {
    return null;
  }
}

/** Render the card to a PNG response, edge-cached. The body is re-wrapped so the response carries a single,
 *  clean cache-control (workers-og otherwise sets its own one-year immutable header). */
export async function ogImageResponse(input: OgCardInput): Promise<Response> {
  const fonts = await loadFonts();
  const image = new ImageResponse(ogCardHtml(input), {
    width: 1200,
    height: 630,
    ...(fonts ? { fonts } : {}),
  });
  return new Response(image.body, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=300, s-maxage=600",
    },
  });
}

export { DEFAULT_HEADLINE };
