// Edge handler for /<slug> — serves the SPA shell so a human lands on the (client-rendered) share page.
//
// Once the data layer exposes a public read, this will fetch the link and rewrite the shell's <head>
// with a per-slug share card (theme/og-card buildShareMeta + HTMLRewriter) so crawlers unfurl correctly.
// For now it passes the shell through unchanged (the brand fallback head applies).
//
// The dot guard lets real root static files (favicon.svg, robots.txt, …) fall through to the asset
// handler — a valid slug is [a-z0-9-] with no dot, so it never collides.

interface Env {
  ASSETS: Fetcher;
}

export const onRequestGet: PagesFunction<Env> = ({ request, env, params }) => {
  const slug = String(params.slug);
  if (slug.includes(".")) return env.ASSETS.fetch(request);
  return env.ASSETS.fetch(new URL("/index.html", request.url));
};
