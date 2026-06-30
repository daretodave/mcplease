import { describe, expect, it, vi } from "vitest";
import type { McpleaseClient } from "./client.js";
import { createData } from "./links.js";

type RpcResult = { data: unknown; error: { message: string } | null };

/** A fake Supabase client whose `rpc` returns a canned result and records its calls — enough to assert
 *  the seam maps names, params, and rows correctly without a live database. */
function fakeClient(impl: (name: string, args: Record<string, unknown>) => RpcResult) {
  const rpc = vi.fn((name: string, args: Record<string, unknown>) =>
    Promise.resolve(impl(name, args)),
  );
  return { client: { rpc } as unknown as McpleaseClient, rpc };
}

/** A snake_case projection row, as the read RPCs return it. */
const ROW = {
  slug: "my-slug",
  kind: "http",
  server_url: "https://example.com/mcp",
  repo_url: null,
  build_cmd: null,
  run_target: null,
  name: "My Server",
  description: null,
  tagline: "one paste away",
};

const EDIT_FIELDS = {
  slug: "renamed",
  serverUrl: "https://example.com/v2",
  repoUrl: null,
  buildCmd: null,
  runTarget: null,
  name: "Renamed",
  description: null,
  tagline: null,
};

describe("data.links", () => {
  it("slugAvailable returns the RPC boolean with the candidate param", async () => {
    const { client, rpc } = fakeClient(() => ({ data: true, error: null }));
    await expect(createData(client).links.slugAvailable("free-one")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("slug_available", { candidate: "free-one" });
  });

  it("getPublic maps the snake_case row to the camelCase domain shape", async () => {
    const { client, rpc } = fakeClient(() => ({ data: [ROW], error: null }));
    const link = await createData(client).links.getPublic("my-slug");
    expect(link).toEqual({
      slug: "my-slug",
      kind: "http",
      serverUrl: "https://example.com/mcp",
      repoUrl: null,
      buildCmd: null,
      runTarget: null,
      name: "My Server",
      description: null,
      tagline: "one paste away",
    });
    expect(rpc).toHaveBeenCalledWith("get_public_link", { want_slug: "my-slug" });
  });

  it("getPublic returns null for an unknown/deleted slug", async () => {
    const { client } = fakeClient(() => ({ data: [], error: null }));
    await expect(createData(client).links.getPublic("nope")).resolves.toBeNull();
  });

  it("getForEdit maps the editable row, or null when the token matches nothing", async () => {
    const hit = fakeClient(() => ({ data: [ROW], error: null }));
    await expect(createData(hit.client).links.getForEdit("a-token")).resolves.toMatchObject({
      slug: "my-slug",
    });
    expect(hit.rpc).toHaveBeenCalledWith("get_link_for_edit", { token: "a-token" });

    const miss = fakeClient(() => ({ data: [], error: null }));
    await expect(createData(miss.client).links.getForEdit("a-token")).resolves.toBeNull();
  });

  it("update sends new_* params and maps the result; null when unauthorized", async () => {
    const { client, rpc } = fakeClient(() => ({
      data: [{ ...ROW, slug: "renamed" }],
      error: null,
    }));
    const out = await createData(client).links.update("a-token", EDIT_FIELDS);
    expect(out).toMatchObject({ slug: "renamed" });
    expect(rpc).toHaveBeenCalledWith(
      "update_link",
      expect.objectContaining({
        token: "a-token",
        new_slug: "renamed",
        new_server_url: "https://example.com/v2",
        new_name: "Renamed",
      }),
    );

    const miss = fakeClient(() => ({ data: [], error: null }));
    await expect(createData(miss.client).links.update("a-token", EDIT_FIELDS)).resolves.toBeNull();
  });

  it("remove returns the RPC boolean with the token param", async () => {
    const { client, rpc } = fakeClient(() => ({ data: true, error: null }));
    await expect(createData(client).links.remove("a-token")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("delete_link", { token: "a-token" });
  });

  it("create returns the slug + the raw edit token", async () => {
    const { client, rpc } = fakeClient(() => ({
      data: [{ slug: "minted-otter-42", edit_token: "the-uuid" }],
      error: null,
    }));
    const res = await createData(client).links.create({
      desiredSlug: null,
      kind: "http",
      serverUrl: "https://example.com/mcp",
      repoUrl: null,
      buildCmd: null,
      runTarget: null,
      name: null,
      description: null,
      tagline: null,
    });
    expect(res).toEqual({ slug: "minted-otter-42", editToken: "the-uuid" });
    expect(rpc).toHaveBeenCalledWith(
      "create_link",
      expect.objectContaining({ desired_slug: null, kind: "http" }),
    );
  });

  it("throws when create returns no row", async () => {
    const { client } = fakeClient(() => ({ data: [], error: null }));
    await expect(
      createData(client).links.create({
        desiredSlug: null,
        kind: "http",
        serverUrl: null,
        repoUrl: null,
        buildCmd: null,
        runTarget: null,
        name: null,
        description: null,
        tagline: null,
      }),
    ).rejects.toThrow(/no row/);
  });

  it("surfaces a Postgrest error as a thrown Error", async () => {
    const { client } = fakeClient(() => ({ data: null, error: { message: "boom" } }));
    await expect(createData(client).links.slugAvailable("x")).rejects.toThrow("boom");
  });

  it("throws on an empty response that carries no error", async () => {
    const { client } = fakeClient(() => ({ data: null, error: null }));
    await expect(createData(client).links.remove("a-token")).rejects.toThrow(/empty response/);
  });
});
