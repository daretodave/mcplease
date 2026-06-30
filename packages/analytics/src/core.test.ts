import { describe, it, expect, afterEach } from "vitest";
import { clearSink, emit, setSink, type Sink } from "./core.js";

afterEach(() => clearSink());

describe("the sink registry", () => {
  it("hands a built payload (event + params) to the active sink", () => {
    const seen: unknown[] = [];
    const sink: Sink = (p) => seen.push(p);
    setSink(sink);
    emit("create_submit", { transport: "http" });
    expect(seen).toEqual([{ event: "create_submit", transport: "http" }]);
  });

  it("drops a push when no sink is installed (silent no-op, never throws)", () => {
    clearSink();
    expect(() => emit("system_view_source", {})).not.toThrow();
  });

  it("replaces the active sink on setSink", () => {
    const a: unknown[] = [];
    const b: unknown[] = [];
    setSink((p) => a.push(p));
    setSink((p) => b.push(p));
    emit("edit_delete", {});
    expect(a).toHaveLength(0);
    expect(b).toHaveLength(1);
  });
});
