import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./query-client";

describe("queryClient", () => {
  it("is a configured TanStack Query client", () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });
});
