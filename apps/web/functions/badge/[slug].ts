// Edge handler for /badge/<slug>.svg — the embeddable README shield.
//
// A lightweight, hand-templated shields-style SVG (no Satori needed), edge-cached. An author drops it in
// their README wrapped in a link to /<slug>, so the badge itself carries no link. The final design adds
// the brand mark + a `connect` / `info` variant (the latter showing the server name + transport, derived
// from the link). Until then this serves the generic `connect` shield.

const LABEL_BG = "#555";
const ACCENT = "#6E56CF";

function shield(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="106" height="20" role="img" aria-label="MCP: connect">
  <title>MCP: connect</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="106" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="44" height="20" fill="${LABEL_BG}"/>
    <rect x="44" width="62" height="20" fill="${ACCENT}"/>
    <rect width="106" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="23" y="15" fill="#010101" fill-opacity=".3">MCP</text>
    <text x="23" y="14">MCP</text>
    <text x="74" y="15" fill="#010101" fill-opacity=".3">connect</text>
    <text x="74" y="14">connect</text>
  </g>
</svg>`;
}

export const onRequestGet: PagesFunction = () => {
  return new Response(shield(), {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
};
