import { css } from "../../../styled-system/css";
import { Icon } from "../icon/icon";

// The authenticate beat for clients with an explicit control — after the server is added, the client shows a
// "Needs authentication" state and a glowing Connect / Authenticate button. We draw that pane: the server, the
// warn cue, and the control the reader taps. (Cursor, Claude, Cline, Zed.)

const frame = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "[9px]",
  padding: "[26px 18px]",
  textAlign: "center",
  background: "bg.inset",
  minHeight: "[190px]",
});

const glyph = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[46px]",
  height: "[46px]",
  borderRadius: "md",
  background: "accent.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
  color: "accent.text",
  fontFamily: "mono",
  fontSize: "h3",
  fontWeight: "semibold",
});

const nameClass = css({ fontSize: "body", fontWeight: "semibold", color: "text.primary" });

const urlClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[7px]",
  fontFamily: "mono",
  fontSize: "xs",
  color: "text.muted",
});

const statusClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[6px]",
  fontSize: "sm",
  fontWeight: "semibold",
  color: "state.warn.text",
});

const buttonClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[7px]",
  marginTop: "[4px]",
  padding: "[9px 22px]",
  borderRadius: "md",
  background: "accent.base",
  color: "accent.fg",
  fontSize: "sm",
  fontWeight: "semibold",
  boxShadow: "glow",
});

export interface AuthSceneProps {
  /** The connector's display name in the client's list. */
  name: string;
  /** The remote URL, shown small under the name. */
  url?: string;
  /** The client's not-yet-authed status line. */
  status?: string;
  /** The control the reader taps — "Connect" or "Authenticate". */
  button?: string;
}

/** The explicit-control authenticate pane — a glowing Connect / Authenticate button on a "needs auth" row. */
export function AuthScene({
  name,
  url,
  status = "Needs authentication",
  button = "Connect",
}: AuthSceneProps) {
  return (
    <div className={frame}>
      <span className={glyph} aria-hidden="true">
        {"{·}"}
      </span>
      <div className={nameClass}>{name}</div>
      {url ? (
        <div className={urlClass}>
          {url}
          <Icon name="external-link" size={12} />
        </div>
      ) : null}
      <div className={statusClass}>
        <Icon name="alert-triangle" size={13} />
        {status}
      </div>
      <span className={buttonClass}>
        {button}
        <Icon name="arrow-right" size={14} />
      </span>
    </div>
  );
}
