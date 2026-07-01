import { css } from "../../../styled-system/css";

// The authenticate beat for clients with no in-app control — a browser consent window opens on its own (often
// after a trust dialog). We draw that window: the address bar, the "Authorize <name>?" prompt, and the Allow
// control. (ChatGPT, VS Code, Windsurf, Goose, Generic.)

const frame = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "[18px 16px 24px]",
  background: "bg.inset",
  minHeight: "[172px]",
});

const win = css({
  width: "[100%]",
  maxWidth: "[300px]",
  borderRadius: "lg",
  overflow: "hidden",
  background: "bg.raised",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  boxShadow: "raised",
});

const bar = css({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  padding: "[7px 10px]",
  borderBottomWidth: "hairline",
  borderBottomStyle: "solid",
  borderBottomColor: "border.subtle",
});

const dot = css({
  width: "[9px]",
  height: "[9px]",
  borderRadius: "round",
  background: "border.strong",
});

const addr = css({
  flex: "[1]",
  marginLeft: "[6px]",
  padding: "[3px 8px]",
  borderRadius: "sm",
  background: "bg.inset",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  fontFamily: "mono",
  fontSize: "[10.5px]",
  color: "text.faint",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const bodyClass = css({ padding: "[16px]", textAlign: "center" });
const q = css({
  fontSize: "sm",
  fontWeight: "semibold",
  color: "text.primary",
  marginBottom: "[4px]",
});
const qName = css({ color: "accent.text" });
const scope = css({ fontSize: "xs", color: "text.muted", marginBottom: "[12px]" });
const actions = css({ display: "flex", gap: "[8px]", justifyContent: "center" });
const deny = css({ padding: "[6px 12px]", fontSize: "xs", color: "text.muted" });
const allow = css({
  padding: "[6px 16px]",
  borderRadius: "md",
  background: "accent.base",
  color: "accent.fg",
  fontSize: "xs",
  fontWeight: "semibold",
  boxShadow: "glow",
});

const foot = css({
  position: "absolute",
  bottom: "[9px]",
  left: "[0]",
  right: "[0]",
  textAlign: "center",
  fontSize: "[10.5px]",
  color: "text.faint",
});

export interface BrowserSceneProps {
  /** The connector name being authorized. */
  name: string;
  /** The provider host shown in the address bar. */
  host?: string;
  /** Whether a trust dialog precedes the browser (VS Code). */
  trust?: boolean;
}

/** The auto-launch OAuth consent window that opens on its own. */
export function BrowserScene({
  name,
  host = "auth.provider.com",
  trust = false,
}: BrowserSceneProps) {
  return (
    <div className={frame}>
      <div className={win}>
        <div className={bar}>
          <span className={dot} />
          <span className={dot} />
          <span className={dot} />
          <span className={addr}>{host}/authorize</span>
        </div>
        <div className={bodyClass}>
          <div className={q}>
            Authorize <span className={qName}>{name}</span>?
          </div>
          <div className={scope}>It can read and act with the tools you allow.</div>
          <div className={actions}>
            <span className={deny}>Deny</span>
            <span className={allow}>Allow</span>
          </div>
        </div>
      </div>
      <div className={foot}>
        {trust ? "after the trust dialog · opens on its own" : "opens on its own"}
      </div>
    </div>
  );
}
