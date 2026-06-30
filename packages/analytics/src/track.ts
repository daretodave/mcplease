import { emit } from "./core.js";
import type { ParamsOf } from "./events.js";

/**
 * Fire a lawful mcplease event. The event name and its params are constrained by the taxonomy in
 * `events.ts` — an unlawful name or the wrong param shape does not compile. Prefer the `track.*` verb
 * helpers at call sites (they read as intent, not strings); the bare `track(name, params)` form is the
 * escape hatch for dynamic dispatch. The verbs live behind `track` so they tree-shake out of first
 * paint until a call site uses one.
 */
export const track = Object.assign(emit, {
  createSubmit: (p: ParamsOf<"create_submit">) => emit("create_submit", p),
  createSuccess: (p: ParamsOf<"create_success">) => emit("create_success", p),
  selectClient: (p: ParamsOf<"share_select_client">) => emit("share_select_client", p),
  copyCommand: (p: ParamsOf<"share_copy_command">) => emit("share_copy_command", p),
  oneClick: (p: ParamsOf<"share_one_click">) => emit("share_one_click", p),
  copyBadge: (p: ParamsOf<"share_copy_badge">) => emit("share_copy_badge", p),
  editSave: (p: ParamsOf<"edit_save">) => emit("edit_save", p),
  editDelete: (p: ParamsOf<"edit_delete">) => emit("edit_delete", p),
  themeToggle: (p: ParamsOf<"system_theme_toggle">) => emit("system_theme_toggle", p),
  viewSource: (p: ParamsOf<"system_view_source">) => emit("system_view_source", p),
});
