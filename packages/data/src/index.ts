// The sealed vendor seam. The domain API — `createData(client).links.*` — arrives with the schema; for
// now this exports the client factory the SPA + the edge create function build on.
export { createBrowserClient, type McpleaseClient } from "./client.js";
