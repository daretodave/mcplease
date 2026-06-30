import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/query-client";
import { CreatePage } from "./pages/create/create";
import { Placeholder } from "./pages/placeholder";
import { SharePage } from "./pages/share/share";

// The client-only route table. The landing is the create form; the rest render a placeholder until their
// real screen is designed. The shapes (/, /<slug>, /e/<uuid>, /terms, /privacy) are the durable part. Static
// segments out-rank the dynamic /:slug, so /terms and /privacy resolve to themselves, never to a slug.
const router = createBrowserRouter([
  {
    path: "/",
    element: <CreatePage />,
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
    element: <SharePage />,
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
