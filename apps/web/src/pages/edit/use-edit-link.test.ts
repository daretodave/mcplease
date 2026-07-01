import type { PublicLink } from "@mcplease/model";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useDeleteLink, useUpdateLink } from "./use-edit-link";

// The mutations are thin wrappers over the token-authorized seam — the test pins that they pass the token
// and fields straight through and surface the seam's result unchanged.

const update = vi.fn();
const remove = vi.fn();
vi.mock("../../lib/data", () => ({
  data: {
    links: { update: (t: string, f: unknown) => update(t, f), remove: (t: string) => remove(t) },
  },
}));

function wrap() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children);
}

const LINK: PublicLink = {
  slug: "my-mcp",
  kind: "http",
  serverUrl: "https://acme.dev/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Acme",
  description: null,
  tagline: "one paste away",
};

describe("useUpdateLink", () => {
  beforeEach(() => update.mockReset());

  it("passes the token + fields to the seam and returns the updated projection", async () => {
    update.mockResolvedValue(LINK);
    const { result } = renderHook(() => useUpdateLink(), { wrapper: wrap() });

    const fields = {
      slug: "my-mcp",
      serverUrl: "https://acme.dev/mcp",
      repoUrl: null,
      buildCmd: null,
      runTarget: null,
      name: "Acme",
      description: null,
      tagline: "one paste away",
    };
    result.current.mutate({ editToken: "tok-123", fields });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(update).toHaveBeenCalledWith("tok-123", fields);
    expect(result.current.data).toEqual(LINK);
  });
});

describe("useDeleteLink", () => {
  beforeEach(() => remove.mockReset());

  it("passes the token to the seam and returns whether a row was removed", async () => {
    remove.mockResolvedValue(true);
    const { result } = renderHook(() => useDeleteLink(), { wrapper: wrap() });

    result.current.mutate("tok-123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(remove).toHaveBeenCalledWith("tok-123");
    expect(result.current.data).toBe(true);
  });
});
