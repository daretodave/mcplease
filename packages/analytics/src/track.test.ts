import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { clearSink, setSink } from "./core.js";
import { track } from "./track.js";

let seen: Array<{ event: string } & Record<string, unknown>>;

beforeEach(() => {
  seen = [];
  setSink((p) => seen.push(p));
});
afterEach(() => clearSink());

describe("track.* verbs", () => {
  it("each verb fires its event name with the given params", () => {
    track.createSubmit({ transport: "http" });
    track.createSuccess({ transport: "stdio" });
    track.selectClient({ client: "cursor", transport: "http" });
    track.copyCommand({ client: "vscode", transport: "stdio" });
    track.oneClick({ client: "cursor", transport: "http" });
    track.copyBadge({ variant: "connect" });
    track.editSave({ transport: "http" });
    track.editDelete({});
    track.themeToggle({ theme: "dark" });
    track.viewSource({});

    expect(seen.map((s) => s.event)).toEqual([
      "create_submit",
      "create_success",
      "share_select_client",
      "share_copy_command",
      "share_one_click",
      "share_copy_badge",
      "edit_save",
      "edit_delete",
      "system_theme_toggle",
      "system_view_source",
    ]);
  });

  it("carries the params through unchanged", () => {
    track.selectClient({ client: "windsurf", transport: "stdio" });
    expect(seen[0]).toEqual({
      event: "share_select_client",
      client: "windsurf",
      transport: "stdio",
    });
  });

  it("exposes the bare track(name, params) escape hatch", () => {
    track("edit_save", { transport: "stdio" });
    expect(seen).toEqual([{ event: "edit_save", transport: "stdio" }]);
  });
});
