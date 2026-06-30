import { describe, it, expect } from "vitest";
import { hexAlpha, mcpleasePreset } from "./preset.js";

/** A theme-conditional token, as the preset emits it. */
type Themed = { value: { base: string; _light: string } };
const HEX = /^#[0-9A-Fa-f]{6}$/;

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
    const bg = mcpleasePreset.theme?.semanticTokens?.colors?.bg as { canvas?: Themed } | undefined;
    expect(bg?.canvas?.value.base).toMatch(HEX);
    expect(bg?.canvas?.value._light).toMatch(HEX);
    expect(bg?.canvas?.value.base).not.toBe(bg?.canvas?.value._light);
  });

  it("materializes the accent as a conditional ramp with rgba washes", () => {
    const accent = mcpleasePreset.theme?.semanticTokens?.colors?.accent as
      | { base?: Themed; soft?: Themed }
      | undefined;
    expect(accent?.base?.value.base).toMatch(HEX);
    expect(accent?.soft?.value.base).toContain("rgba(");
  });

  it("groups the state colors with a DEFAULT solid + a soft wash", () => {
    const state = mcpleasePreset.theme?.semanticTokens?.colors?.state as
      | { ok?: { DEFAULT?: Themed; soft?: Themed } }
      | undefined;
    expect(state?.ok?.DEFAULT?.value.base).toMatch(HEX);
    expect(state?.ok?.soft?.value.base).toContain("rgba(");
  });

  it("appends units to numeric tokens and a platform stack to fonts", () => {
    const radii = mcpleasePreset.theme?.tokens?.radii as
      | Record<string, { value: string }>
      | undefined;
    expect(radii?.lg?.value).toBe("16px");
    expect(radii?.round?.value).toBe("50%");
    const fontSizes = mcpleasePreset.theme?.tokens?.fontSizes as
      | Record<string, { value: string }>
      | undefined;
    expect(fontSizes?.display?.value).toBe("44px");
    const tracking = mcpleasePreset.theme?.tokens?.letterSpacings as
      | Record<string, { value: string }>
      | undefined;
    expect(tracking?.wordmark?.value).toBe("-0.03em");
    const durations = mcpleasePreset.theme?.tokens?.durations as
      | Record<string, { value: string }>
      | undefined;
    expect(durations?.delight?.value).toBe("1100ms");
    const fonts = mcpleasePreset.theme?.tokens?.fonts as
      | Record<string, { value: string }>
      | undefined;
    expect(fonts?.sans?.value).toContain("Space Grotesk");
    expect(fonts?.sans?.value).toContain("system-ui");
  });

  it("composes the soft shadow set conditionally and refs the accent ring", () => {
    const shadows = mcpleasePreset.theme?.semanticTokens?.shadows as { card?: Themed } | undefined;
    expect(shadows?.card?.value.base).toContain("rgba(0,0,0,");
    expect(shadows?.card?.value._light).toContain("rgba(11,13,16,");
    const rawShadows = mcpleasePreset.theme?.tokens?.shadows as
      | Record<string, { value: string }>
      | undefined;
    expect(rawShadows?.ring?.value).toContain("{colors.accent.ring}");
  });
});
