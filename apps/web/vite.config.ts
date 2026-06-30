import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "styled-system": fileURLToPath(new URL("./styled-system", import.meta.url)),
    },
  },
  build: {
    // The real byte ceiling is scripts/check-bundle-budget.ts (a fail-the-build gzip gate run after
    // build, in CI). With that in place, vite's generic raw-size warning is redundant noise — lifted
    // so it stops crying wolf. Raising the gate's ceiling is a separate, reviewed edit.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // The entry keeps the bare `index-*` name (the byte gate matches it as first paint); every
        // ASYNC chunk (the lazy route screens, once they exist) gets a distinct `chunk-*` prefix so
        // each carries its OWN named ceiling instead of hiding under the entry's pattern.
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/chunk-[name]-[hash].js",
      },
    },
  },
});
