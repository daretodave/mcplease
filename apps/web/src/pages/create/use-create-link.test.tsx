import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CreateLinkError, useCreateLink, type CreateLinkRequest } from "./use-create-link";

const REQUEST: CreateLinkRequest = {
  turnstileToken: "t",
  kind: "http",
  serverUrl: "https://example.com/mcp",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: null,
  description: null,
  tagline: null,
  desiredSlug: null,
};

function wrap() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function mockFetch(response: { ok: boolean; status: number; body: unknown }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: () => Promise.resolve(response.body),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("useCreateLink", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts the request and returns the slug + edit url", async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      body: { slug: "sunny-otter-42", editUrl: "https://mcplease.io/e/uuid" },
    });
    const { result } = renderHook(() => useCreateLink(), { wrapper: wrap() });

    const created = await result.current.mutateAsync(REQUEST);

    expect(created).toEqual({ slug: "sunny-otter-42", editUrl: "https://mcplease.io/e/uuid" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/links",
      expect.objectContaining({ method: "POST", body: JSON.stringify(REQUEST) }),
    );
  });

  it("surfaces the edge error code on a taken slug", async () => {
    mockFetch({ ok: false, status: 409, body: { error: "slug_taken" } });
    const { result } = renderHook(() => useCreateLink(), { wrapper: wrap() });

    await expect(result.current.mutateAsync(REQUEST)).rejects.toMatchObject({
      code: "slug_taken",
      status: 409,
    });
  });

  it("falls back to a generic code when the error body is unreadable", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    });
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useCreateLink(), { wrapper: wrap() });

    await expect(result.current.mutateAsync(REQUEST)).rejects.toBeInstanceOf(CreateLinkError);
    await expect(result.current.mutateAsync(REQUEST)).rejects.toMatchObject({
      code: "create_failed",
    });
  });
});
