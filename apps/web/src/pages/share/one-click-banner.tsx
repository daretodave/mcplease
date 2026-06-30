import type { ClientId } from "@mcplease/client-matrix";
import { useState } from "react";
import { css } from "../../../styled-system/css";
import { Button } from "../../components/button/button";
import { ClientGlyph } from "../../components/client-glyph/client-glyph";
import { DelightSpark } from "../../components/delight-spark/delight-spark";
import { CONNECT_LABEL } from "./clients";

// The express lane: a prominent "Add in one click" shown ABOVE the manual steps, which always remain as the
// fallback. Three clients can be handed off to: Cursor and VS Code via a custom URL scheme that opens the
// app, and Claude via an https://claude.ai link that opens a pre-filled "Add custom connector" dialog. None
// of them reports success back to the page — so we never claim "Added", only "Opening…". For the custom
// schemes we infer the launch from the page losing focus, and surface the manual steps if nothing opened.

const banner = css({
  display: "flex",
  alignItems: "center",
  gap: "[14px]",
  padding: "[16px 18px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
  background: "accent.soft",
  borderRadius: "lg",
  marginBottom: "3",
  "@media (max-width: 560px)": { flexWrap: "wrap" },
});

const main = css({ flex: "[1]", minWidth: "[0]" });

const title = css({
  fontSize: "[15px]",
  fontWeight: "semibold",
  letterSpacing: "[-0.01em]",
  color: "text.primary",
});

const sub = css({
  marginTop: "[2px]",
  fontSize: "[13px]",
  color: "text.muted",
  lineHeight: "[1.45]",
});

const hint = css({ marginTop: "[6px]", fontSize: "[12px]", color: "text.muted" });

const action = css({ flexShrink: "0" });

// Visually hidden, but announced — the spark is decorative/aria-hidden and the button's own label change
// isn't reliably announced, so progress rides this live region.
const srOnly = css({
  position: "absolute",
  width: "[1px]",
  height: "[1px]",
  padding: "[0]",
  margin: "[-1px]",
  overflow: "hidden",
  clipPath: "[inset(50%)]",
  whiteSpace: "nowrap",
  borderWidth: "[0]",
});

type AddPhase = "idle" | "opening" | "sent" | "failed";

// A custom-scheme launch (cursor://, vscode:) doesn't report success to JS — `location.assign` never throws
// when no handler is registered. So we infer it: if the OS hands off to the app, our page loses focus or
// visibility; if nothing is registered, it never does. Settle "opened" on the first blur/hide, else "not
// opened" after a short wait. Best-effort — the manual steps below are always the real fallback.
function detectHandoff(onResult: (opened: boolean) => void): void {
  let settled = false;
  const onVisibility = () => {
    if (document.visibilityState === "hidden") settle(true);
  };
  const onBlur = () => settle(true);
  const timer = setTimeout(() => settle(false), 2200);
  function settle(opened: boolean) {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("blur", onBlur);
    onResult(opened);
  }
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("blur", onBlur);
}

export interface OneClickBannerProps {
  client: ClientId;
  /** The install hand-off: a custom scheme (`cursor://`, `vscode:`) or Claude's `https://claude.ai` link. */
  href: string | null;
  /** Fired when the reader taps Add — the hook for `track.oneClick`. */
  onAdd: () => void;
}

/** The one-click Add banner. Tapping hands off to the install link, plays the success beat, and tells the
 *  truth: "Opening…" then "Sent" (we can't see the install complete), and for a custom scheme that never
 *  opens, it points at the manual steps below — it never claims "Added". */
export function OneClickBanner({ client, href, onAdd }: OneClickBannerProps) {
  const [spark, setSpark] = useState(0);
  const [phase, setPhase] = useState<AddPhase>("idle");
  const label = CONNECT_LABEL[client];
  const webLink = href != null && href.startsWith("https://");

  function add() {
    onAdd();
    setSpark((n) => n + 1);
    setPhase("opening");
    if (!href) {
      setPhase("sent");
      return;
    }
    if (webLink) {
      // An https connector link (Claude) — opens a new tab where the reader confirms; the page keeps its
      // place. We can't observe the confirm, so we stop at "sent".
      try {
        window.open(href, "_blank", "noopener,noreferrer");
      } catch {
        /* popup blocked — the manual steps below still work */
      }
      setPhase("sent");
      return;
    }
    // A custom scheme (cursor://, vscode:) — hand it to the OS and infer whether anything actually opened.
    try {
      window.location.assign(href);
    } catch {
      /* the OS owns it from here — see detectHandoff */
    }
    detectHandoff((opened) => setPhase(opened ? "sent" : "failed"));
  }

  const buttonLabel =
    phase === "opening"
      ? `Opening ${label}…`
      : phase === "sent"
        ? `Sent to ${label}`
        : `Add to ${label}`;
  const announce =
    phase === "opening"
      ? `Opening ${label}`
      : phase === "sent"
        ? `Sent to ${label}`
        : phase === "failed"
          ? `${label} didn’t open — use the steps below`
          : "";

  return (
    <div className={banner}>
      <ClientGlyph client={client} size={40} selected />
      <div className={main}>
        <div className={title}>Add to {label} in one click</div>
        <div className={sub}>
          {webLink
            ? `Opens ${label} to add the connector — you’ll review and confirm.`
            : `Opens ${label} and adds the server.`}
        </div>
        {phase === "failed" && (
          <div className={hint}>{label} didn’t open — follow the steps below ↓</div>
        )}
      </div>
      <DelightSpark className={action} trigger={spark} size={20}>
        <Button icon={phase === "sent" ? "check" : "arrow-right"} onClick={add}>
          {buttonLabel}
        </Button>
      </DelightSpark>
      <span className={srOnly} role="status" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
