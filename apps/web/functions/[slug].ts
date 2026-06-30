// Edge handler for /<slug> — serves the SPA shell, but first rewrites its <head> with a per-link share
// card so crawlers and chat unfurlers see THIS link's title, description, and image (the SPA is static, so
// without this they'd only ever see the brand fallback head). The body is untouched: React still boots and
// renders the live share page on the client. A read uses the anon key against the public RPC — the
// service-role key lives only in the create endpoint.
//
// The dot guard lets real root static files (favicon.svg, robots.txt, …) fall through to the asset handler —
// a valid slug is [a-z0-9-] with no dot, so it never collides.

import { createBrowserClient, createData } from "@mcplease/data";
import type { PublicLink } from "@mcplease/model";
import { buildShareMeta, type ShareMeta } from "@mcplease/theme/og-card";

interface Env {
  ASSETS: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

/** Escape a value bound for raw markup. `setAttribute` escapes its own values; this guards the image tags
 *  injected with `after(html)`. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Rewrite the shell's <head> for this link — title, description, canonical, and the Open Graph / Twitter
 *  card (image included), all absolute so a scraper never has to resolve a relative URL. */
function injectMeta(shell: Response, meta: ShareMeta): Response {
  const imageTags =
    `<meta property="og:image" content="${esc(meta.image)}" />` +
    `<meta property="og:image:alt" content="${esc(meta.imageAlt)}" />` +
    `<meta name="twitter:image" content="${esc(meta.image)}" />`;

  return new HTMLRewriter()
    .on("title", {
      element(el) {
        el.setInnerContent(meta.title);
      },
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute("content", meta.description);
      },
    })
    .on('link[rel="canonical"]', {
      element(el) {
        el.setAttribute("href", meta.url);
      },
    })
    .on('meta[property="og:url"]', {
      element(el) {
        el.setAttribute("content", meta.url);
      },
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute("content", meta.title);
      },
    })
    .on('meta[property="og:description"]', {
      element(el) {
        el.setAttribute("content", meta.description);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute("content", meta.title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(el) {
        el.setAttribute("content", meta.description);
      },
    })
    .on('meta[name="twitter:card"]', {
      element(el) {
        // A per-link image earns the large card; carry the image tags in right after it.
        el.setAttribute("content", "summary_large_image");
        el.after(imageTags, { html: true });
      },
    })
    .transform(shell);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const slug = String(params.slug);
  if (slug.includes(".")) return env.ASSETS.fetch(request);

  const shell = await env.ASSETS.fetch(new URL("/index.html", request.url));
  const origin = new URL(request.url).origin;

  let link: PublicLink | null;
  try {
    const data = createData(createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));
    link = await data.links.getPublic(slug);
  } catch {
    // A read failure must never 500 the page — serve the brand shell and let the SPA resolve on the client.
    return shell;
  }

  return injectMeta(shell, buildShareMeta(link, slug, origin));
};
