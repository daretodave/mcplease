// Edge handler for /og/<slug>.png — the share-card image a crawler unfurls (referenced by buildShareMeta's
// og:image). It reads the link with the anon key and renders the brand OG card with the link's tagline (or
// name) as the headline, via workers-og (Satori → resvg-wasm → PNG). A read blip falls back to the brand
// default headline rather than failing the image.

import { createBrowserClient, createData } from "@mcplease/data";
import type { PublicLink } from "@mcplease/model";
import { DEFAULT_HEADLINE, ogImageResponse } from "../_og";

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

/** The card headline for a link: its tagline, else its name, else the brand default. */
function headlineFor(link: PublicLink | null): string {
  return link?.tagline?.trim() || link?.name?.trim() || DEFAULT_HEADLINE;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  const slug = String(params.slug).replace(/\.png$/, "");
  let link: PublicLink | null = null;
  try {
    const data = createData(createBrowserClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY));
    link = await data.links.getPublic(slug);
  } catch {
    // A read blip shouldn't fail the image — render the default headline.
  }
  return ogImageResponse({ headline: headlineFor(link), slug });
};
