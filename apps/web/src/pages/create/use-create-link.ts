import { useMutation } from "@tanstack/react-query";

// The submit half of the create flow: POST the form to the edge endpoint, which verifies Turnstile and runs
// create_link with the service-role key, then hands back the slug + the one-time edit URL. The browser never
// touches that key or the create RPC — it only ever sees this request and its result.

/** The create request body — the transport, its server fields, the author copy, the Turnstile token. */
export interface CreateLinkRequest {
  turnstileToken: string;
  kind: "http" | "stdio";
  serverUrl: string | null;
  repoUrl: string | null;
  buildCmd: string | null;
  runTarget: string | null;
  name: string | null;
  description: string | null;
  tagline: string | null;
  desiredSlug: string | null;
}

/** What a successful create returns: the (possibly minted) slug + the one-time edit link. */
export interface CreateLinkResult {
  slug: string;
  editUrl: string;
}

/** A failed create, carrying the edge's stable error code (e.g. `slug_taken`, `turnstile_failed`) so the
 *  form can show the right message and re-focus the right field. */
export class CreateLinkError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
    this.name = "CreateLinkError";
  }
}

async function postCreateLink(request: CreateLinkRequest): Promise<CreateLinkResult> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    let code = "create_failed";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) code = body.error;
    } catch {
      // a non-JSON error body — keep the generic code
    }
    throw new CreateLinkError(code, res.status);
  }
  return (await res.json()) as CreateLinkResult;
}

/** Submit the create form. The caller drives it with `mutate(request, { onSuccess })`; failures arrive as a
 *  `CreateLinkError`. */
export function useCreateLink() {
  return useMutation<CreateLinkResult, CreateLinkError, CreateLinkRequest>({
    mutationFn: postCreateLink,
  });
}
