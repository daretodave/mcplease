// The sealed vendor seam. App code, components, and the edge build a client with one of the factories,
// then call the domain API — `createData(client).links.*` — and never name the vendor or a table.
export { createBrowserClient, createServiceClient, type McpleaseClient } from "./client.js";
export {
  createData,
  type Data,
  type LinksApi,
  type CreateLinkInput,
  type UpdateLinkInput,
  type CreatedLink,
} from "./links.js";
