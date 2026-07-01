import type { UpdateLinkInput } from "@mcplease/data";
import type { PublicLink } from "@mcplease/model";
import { useMutation } from "@tanstack/react-query";
import { data } from "../../lib/data";

// The write half of the edit flow. Both mutations are token-authorized at the seam — the unguessable UUID
// edit link is re-hashed and verified inside the RPC (there is no session). The browser holds only the anon
// key; possession of the token is the whole authorization (spec §4.4, §8).

/** Apply an edit. Resolves to the updated public projection, or null when the token no longer authorizes a
 *  live row (deleted or bad token). */
export function useUpdateLink() {
  return useMutation<PublicLink | null, Error, { editToken: string; fields: UpdateLinkInput }>({
    mutationFn: ({ editToken, fields }) => data.links.update(editToken, fields),
  });
}

/** Soft-delete a link. Resolves to whether a live row was removed. */
export function useDeleteLink() {
  return useMutation<boolean, Error, string>({
    mutationFn: (editToken) => data.links.remove(editToken),
  });
}
