// Edge handler for POST /api/links — create a link.
//
// The real endpoint verifies the Turnstile token at the edge, then calls the create_link RPC with the
// service-role key (the ONLY place that key ever lives) and returns { slug, editUrl } plus the raw edit
// token exactly once. None of that exists yet, so this answers 501 until the create flow lands.

export const onRequestPost: PagesFunction = () => {
  return new Response(JSON.stringify({ error: "not_implemented" }), {
    status: 501,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
