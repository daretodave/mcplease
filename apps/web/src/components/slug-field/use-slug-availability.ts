import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { slugProblem } from "@mcplease/slug";
import { data } from "../../lib/data";
import type { SlugStatus } from "./slug-field";

// Turns a raw slug claim into the live status the SlugField shows. Format is judged instantly (it is pure,
// local, and the most useful message wins — a one-letter claim reads "too short", never "reserved"); only a
// well-formed claim reaches the server, and only after it stops changing for a beat, so a fast typist fires
// one lookup, not one per keystroke. The check is advisory: the database's unique-on-live-slug index is the
// real arbiter, so a lookup that can't complete resolves to "unknown" and we fail OPEN — the create call
// gets the final word rather than the form blocking on a flaky network.

const DEBOUNCE_MS = 650;

/** The realtime availability status for a slug claim, debounced and format-gated. */
export function useSlugAvailability(raw: string): SlugStatus {
  const slug = raw.trim().toLowerCase();

  // The value that actually reaches the server trails the input by one quiet beat.
  const [debounced, setDebounced] = useState(slug);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(slug), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [slug]);

  const valid = slug !== "" && slugProblem(slug) === null;
  const settled = debounced === slug;

  const query = useQuery({
    queryKey: ["slug-available", debounced],
    // The advisory failure mode lives here: a lookup that throws resolves to null ("unknown") rather than
    // rejecting, so the status falls open to available and the create call — not a network blip — decides.
    queryFn: async (): Promise<boolean | null> => {
      try {
        return await data.links.slugAvailable(debounced);
      } catch {
        return null;
      }
    },
    // Only a well-formed, settled, non-empty claim is worth a lookup.
    enabled: valid && settled,
    staleTime: 30_000,
    retry: false,
    // Run even when the browser reports offline — the default "online" mode would PAUSE the query (queryFn
    // never runs, data stays undefined) and the status would stick on "checking", hard-blocking submit. We
    // want the opposite: let it run, let a real failure fall through to the fail-open null.
    networkMode: "always",
  });

  if (slug === "") return "idle";
  if (!valid) return "invalid";
  // Still typing toward the debounce, or the lookup is in flight.
  if (!settled || query.isFetching) return "checking";
  if (query.data === false) return "taken";
  // A free slug, or an unknown (null) advisory result we don't block on.
  if (query.data === true || query.data === null) return "available";
  return "checking";
}
