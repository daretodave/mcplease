import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/query-client";
import { Placeholder } from "./pages/placeholder";

// The client-only route table. Each entry renders a placeholder until its real screen is designed; the
// shapes (/, /<slug>, /e/<uuid>, /terms, /privacy) are the durable part. Static segments out-rank the
// dynamic /:slug, so /terms and /privacy resolve to themselves, never to a slug.
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Placeholder
        title="mcplease"
        blurb="Paste your MCP server, get a shareable link. Whoever opens it picks their client and connects in a click. The create form is on its way."
      />
    ),
  },
  {
    path: "/e/:uuid",
    element: (
      <Placeholder
        title="Edit your link"
        blurb="Your one-time edit link opens here — change the server, the slug, or the details. Coming soon."
      />
    ),
  },
  {
    path: "/terms",
    element: (
      <Placeholder
        title="Terms"
        blurb="Short and plain — what we store and how to remove it. Coming soon."
      />
    ),
  },
  {
    path: "/privacy",
    element: (
      <Placeholder
        title="Privacy"
        blurb="Anonymous analytics, no accounts. The details land here. Coming soon."
      />
    ),
  },
  {
    path: "/:slug",
    element: (
      <Placeholder
        title="Connect to this MCP server"
        blurb="This is where a shared server shows your client the way to connect. The instructions are on their way."
      />
    ),
  },
  {
    path: "*",
    element: (
      <Placeholder
        title="Not found"
        blurb="That page doesn't exist. Head to mcplease.io to share an MCP server."
      />
    ),
  },
]);

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
