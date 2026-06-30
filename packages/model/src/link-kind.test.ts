import { describe, it, expect } from "vitest";
import { LINK_KINDS, isLinkKind } from "./link-kind.js";

describe("LINK_KINDS", () => {
  it("is http then stdio (http is the default)", () => {
    expect(LINK_KINDS).toEqual(["http", "stdio"]);
  });
});

describe("isLinkKind", () => {
  it("accepts the two known kinds", () => {
    expect(isLinkKind("http")).toBe(true);
    expect(isLinkKind("stdio")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isLinkKind("sse")).toBe(false);
    expect(isLinkKind("")).toBe(false);
    expect(isLinkKind("HTTP")).toBe(false);
  });
});
