// Edge handler for /og-default.png — the fallback share card buildShareMeta points at for an unknown or
// removed slug (and any non-slug route). Same brand card as /og/<slug>.png, with the default headline and the
// bare mcplease.io URL. A static route, so it needs no link read.

import { DEFAULT_HEADLINE, ogImageResponse } from "./_og";

export const onRequestGet: PagesFunction = () => {
  return ogImageResponse({ headline: DEFAULT_HEADLINE, slug: "" });
};
