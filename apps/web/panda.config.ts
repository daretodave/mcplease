import { defineConfig } from "@pandacss/dev";
import { mcpleasePreset } from "@mcplease/theme/preset";

export default defineConfig({
  presets: [mcpleasePreset],
  // Globals come from the preset — no surprise resets.
  preflight: false,
  // "Never invent colors" as a compile error: a raw hex is rejected, styles flow from tokens. Mock-
  // tuned dimensions stay as bracketed [values] until a real scale emerges through a design pass.
  strictTokens: true,
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
});
