import { describe, expect, it } from "vitest";
import { data } from "./data";

describe("data handle", () => {
  it("exposes the links domain API over the browser anon client", () => {
    expect(typeof data.links.slugAvailable).toBe("function");
    expect(typeof data.links.getPublic).toBe("function");
    expect(typeof data.links.getForEdit).toBe("function");
    expect(typeof data.links.create).toBe("function");
  });
});
