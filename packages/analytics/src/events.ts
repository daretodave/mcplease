// THE MCPLEASE TRACKING LAW, encoded as TypeScript so an unlawful event cannot compile.
// Every custom event is snake_case, <= 40 chars, begins with one of four surface tokens
// (create_/share_/edit_/system_), and may carry ONLY the canonical low-cardinality enum params below —
// never the server URL, never PII, never free text. @mcplease/analytics is the only push path; raw
// window.dataLayer/gtag is lint-banned outside this package.

// ---- Canonical param vocabulary (declared here so the package is self-contained; mirrors the link
//      kinds + the client matrix without importing them, exactly so analytics drags in no app graph) ----

/** The transport a link describes (mirrors @mcplease/model LinkKind). */
export type Transport = "http" | "stdio";

/** Which client a share action targeted (mirrors @mcplease/client-matrix ClientId). */
export type Client =
  | "claude-code"
  | "claude-desktop"
  | "chatgpt"
  | "cursor"
  | "vscode"
  | "windsurf"
  | "cline"
  | "zed"
  | "goose"
  | "generic";

/** Which README badge variant was copied. */
export type BadgeVariant = "connect" | "info";

/** The resolved appearance a toggle landed on. */
export type Theme = "dark" | "light";

/** GA4 consent signal. */
export type ConsentState = "granted" | "denied";

// ---- The per-event contracts ----

/** The lawful event roster: each key is an event name, each value its exact param shape. Adding an
 *  event here (and to EVENT_NAMES) is the ONLY way to make it trackable. */
export interface EventParamMap {
  /** the create form was submitted (after Turnstile) */
  create_submit: { transport: Transport };
  /** a link was minted */
  create_success: { transport: Transport };
  /** a visitor picked their client on the share page */
  share_select_client: { client: Client; transport: Transport };
  /** copied the client's setup command/JSON */
  share_copy_command: { client: Client; transport: Transport };
  /** used the one-click Add deep link */
  share_one_click: { client: Client; transport: Transport };
  /** copied the README badge embed */
  share_copy_badge: { variant: BadgeVariant };
  /** an edit was saved via the UUID link */
  edit_save: { transport: Transport };
  /** a link was soft-deleted via the UUID link */
  edit_delete: Record<string, never>;
  /** the dark/light toggle was flipped */
  system_theme_toggle: { theme: Theme };
  /** the footer "view source" link was followed */
  system_view_source: Record<string, never>;
}

/** A lawful event name. */
export type McpleaseEvent = keyof EventParamMap;

/** The params for a given event. */
export type ParamsOf<E extends McpleaseEvent> = EventParamMap[E];

/** The runtime roster (the starter set) — mirrors the keys of EventParamMap; the parity is
 *  guarded by a test, so the two can't silently drift. */
export const EVENT_NAMES = [
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
] as const satisfies readonly McpleaseEvent[];

/** The lawful surface prefixes. */
export const SURFACES = ["create_", "share_", "edit_", "system_"] as const;
