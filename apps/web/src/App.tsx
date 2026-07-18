import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { queryClient } from "./lib/query-client";
import { CreatePage } from "./pages/create/create";
import { EditPage } from "./pages/edit/edit";
import { PrivacyPage } from "./pages/legal/privacy";
import { TermsPage } from "./pages/legal/terms";
import { Placeholder } from "./pages/placeholder";
import { SharePage } from "./pages/share/share";

// The client-only route table. The shapes (/, /<slug>, /e/<uuid>, /terms, /privacy) are the durable part.
// Static segments out-rank the dynamic /:slug, so /terms and /privacy resolve to themselves, never to a
// slug — and the slug rules reserve both words, so no link can ever claim them.
const router = createBrowserRouter([
  {
    path: "/",
    element: <CreatePage />,
  },
  {
    path: "/e/:uuid",
    element: <EditPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
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
