import { initGa4 } from "@mcplease/analytics/web";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env } from "./lib/env";
import { startAppearanceSync } from "./stores";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("missing #root");

// Re-affirm the theme from the store (index.html painted it before first paint) + repaint on OS flips.
startAppearanceSync();
// Boot GA4 — a no-op unless a measurement id is set (production only); consent defaults to denied, so
// dev / preview / hermetic E2E stay silent.
initGa4(env.ga4MeasurementId);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
