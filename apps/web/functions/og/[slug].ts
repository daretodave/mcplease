// Edge handler for /og/<slug>.png — the share card image.
//
// The final card is rendered with workers-og (Satori → SVG → resvg-wasm → PNG) from the link's name +
// tagline. Until that lands, this returns a self-contained, brand-themed SVG card (no dependencies),
// edge-cached. Most unfurlers accept SVG; the PNG renderer replaces this without changing the route.

const CANVAS = "#0B0D12";
const INK = "#F7F7F5";
const ACCENT = "#6E56CF";

function card(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CANVAS}"/>
  <rect x="80" y="80" width="1040" height="470" rx="24" fill="none" stroke="${ACCENT}" stroke-width="3"/>
  <text x="120" y="300" font-family="system-ui, sans-serif" font-size="56" font-weight="700" fill="${INK}">Connect to MCP</text>
  <text x="120" y="370" font-family="system-ui, sans-serif" font-size="32" fill="${ACCENT}">mcplease.io</text>
</svg>`;
}

export const onRequestGet: PagesFunction = () => {
  return new Response(card(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
