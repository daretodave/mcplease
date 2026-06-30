import { describe, it, expect } from "vitest";
import { hexAlpha, mcpleasePreset } from "./preset.js";

describe("hexAlpha", () => {
  it("materializes a hex + alpha as rgba()", () => {
    expect(hexAlpha("#0B0D12", 0.5)).toBe("rgba(11,13,18,0.5)");
  });
});

describe("mcpleasePreset", () => {
  it("declares the light condition (the dark base swaps under [data-theme=light])", () => {
    expect(mcpleasePreset.conditions?.light).toBe("[data-theme=light] &");
  });

  it("materializes the surface ramp as conditional base/_light tokens", () => {
    const canvas = mcpleasePreset.theme?.semanticTokens?.colors?.canvas as
      | { value: { base: string; _light: string } }
      | undefined;
    expect(canvas?.value.base).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(canvas?.value._light).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(canvas?.value.base).not.toBe(canvas?.value._light);
  });

  it("appends px units to numeric radii and a platform stack to fonts", () => {
    const card = mcpleasePreset.theme?.tokens?.radii?.card as { value: string } | undefined;
    expect(card?.value).toBe("12px");
    const ui = mcpleasePreset.theme?.tokens?.fonts?.ui as { value: string } | undefined;
    expect(ui?.value).toContain("system-ui");
  });

  it("materializes accent washes as color-mix() (a semantic token group)", () => {
    const accent = mcpleasePreset.theme?.semanticTokens?.colors?.accent as Record<
      string,
      { value: string }
    >;
    expect(accent.a8?.value).toContain("color-mix(");
  });
});
