import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSlugAvailability } from "./use-slug-availability";

const slugAvailable = vi.fn<(slug: string) => Promise<boolean | null>>();
vi.mock("../../lib/data", () => ({
  data: { links: { slugAvailable: (slug: string) => slugAvailable(slug) } },
}));

/** A fresh QueryClient per render so one test's cache never leaks into the next. */
function wrap() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("useSlugAvailability", () => {
  beforeEach(() => slugAvailable.mockReset());

  it("is idle for an empty claim and never asks the server", () => {
    const { result } = renderHook(() => useSlugAvailability("  "), { wrapper: wrap() });
    expect(result.current).toBe("idle");
    expect(slugAvailable).not.toHaveBeenCalled();
  });

  it("flags a malformed claim instantly, without a lookup", () => {
    const { result } = renderHook(() => useSlugAvailability("a"), { wrapper: wrap() });
    expect(result.current).toBe("invalid"); // one character — too short
    expect(slugAvailable).not.toHaveBeenCalled();
  });

  it("treats a reserved word as invalid", () => {
    const { result } = renderHook(() => useSlugAvailability("api"), { wrapper: wrap() });
    expect(result.current).toBe("invalid");
    expect(slugAvailable).not.toHaveBeenCalled();
  });

  it("debounces a changed claim, then reports it available", async () => {
    slugAvailable.mockResolvedValue(true);
    const { result, rerender } = renderHook((s: string) => useSlugAvailability(s), {
      wrapper: wrap(),
      initialProps: "",
    });
    expect(result.current).toBe("idle");

    rerender("my-server");
    expect(result.current).toBe("checking"); // debounce pending — server not yet asked

    await waitFor(() => expect(result.current).toBe("available"), { timeout: 2000 });
    expect(slugAvailable).toHaveBeenCalledWith("my-server");
  });

  it("reports a taken claim", async () => {
    slugAvailable.mockResolvedValue(false);
    const { result, rerender } = renderHook((s: string) => useSlugAvailability(s), {
      wrapper: wrap(),
      initialProps: "",
    });
    rerender("acme");
    await waitFor(() => expect(result.current).toBe("taken"), { timeout: 2000 });
  });

  it("lowercases the claim before the lookup", async () => {
    slugAvailable.mockResolvedValue(true);
    const { rerender } = renderHook((s: string) => useSlugAvailability(s), {
      wrapper: wrap(),
      initialProps: "",
    });
    rerender("My-Server");
    await waitFor(() => expect(slugAvailable).toHaveBeenCalledWith("my-server"), { timeout: 2000 });
  });

  it("fails open (available) on an unknown result", async () => {
    // A lookup that can't decide resolves to null (the hook's queryFn maps a failed check to this); the
    // form must not block on an advisory check it couldn't complete — the create call gets the final word.
    slugAvailable.mockResolvedValue(null);
    const { result, rerender } = renderHook((s: string) => useSlugAvailability(s), {
      wrapper: wrap(),
      initialProps: "",
    });
    rerender("good-slug");
    await waitFor(() => expect(result.current).toBe("available"), { timeout: 2000 });
  });

  it("treats the caller's own current slug as idle and never asks the server", () => {
    // The edit form owns a slug; re-typing it must not read "taken" (you can't collide with yourself) nor
    // fire a lookup. Case/whitespace-insensitively equal to `current` → idle.
    const { result } = renderHook(() => useSlugAvailability("My-Slug", "my-slug"), {
      wrapper: wrap(),
    });
    expect(result.current).toBe("idle");
    expect(slugAvailable).not.toHaveBeenCalled();
  });

  it("checks a changed slug even when a current one is owned", async () => {
    slugAvailable.mockResolvedValue(true);
    const { result, rerender } = renderHook((s: string) => useSlugAvailability(s, "old-slug"), {
      wrapper: wrap(),
      initialProps: "old-slug",
    });
    expect(result.current).toBe("idle"); // unchanged from the owned slug

    rerender("new-slug");
    await waitFor(() => expect(result.current).toBe("available"), { timeout: 2000 });
    expect(slugAvailable).toHaveBeenCalledWith("new-slug");
  });
});
