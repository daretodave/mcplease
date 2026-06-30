import type { ClientId } from "@mcplease/client-matrix";
import { useState } from "react";
import { css } from "../../../styled-system/css";
import { Button } from "../../components/button/button";
import { ClientGlyph } from "../../components/client-glyph/client-glyph";
import { DelightSpark } from "../../components/delight-spark/delight-spark";
import { CONNECT_LABEL } from "./clients";
import type { OneClickMode } from "./one-click";

// The express lane: a prominent "Add in one click" shown ABOVE the manual steps, which always remain as the
// fallback. `full` (Cursor, VS Code) hands the browser the install deep link; `partial` (Claude Desktop)
// has no install URL — it acknowledges the tap and the reader finishes the one manual step below.

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

const action = css({ flexShrink: "0" });

// Visually hidden, but announced — the spark is decorative/aria-hidden and the button's own label change
// isn't reliably announced, so success rides this live region (it matters most in partial mode, where
// nothing else signals the tap registered).
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

export interface OneClickBannerProps {
  client: ClientId;
  mode: OneClickMode;
  /** The install deep link (full clients), or `null` when the flow finishes in-app (partial). */
  href: string | null;
  /** Fired when the reader taps Add — the hook for `track.oneClick`. */
  onAdd: () => void;
}

/** The one-click Add banner. Tapping hands off to the deep link when there is one, and always plays the
 *  success beat so the tap feels acknowledged even when the install finishes inside the client. */
export function OneClickBanner({ client, mode, href, onAdd }: OneClickBannerProps) {
  const [spark, setSpark] = useState(0);
  const [added, setAdded] = useState(false);
  const label = CONNECT_LABEL[client];

  function add() {
    onAdd();
    setAdded(true);
    setSpark((n) => n + 1);
    if (href) {
      // Hand the custom-scheme link to the OS, which opens the client. jsdom can't navigate — harmless here.
      try {
        window.location.assign(href);
      } catch {
        /* the install link is the client's to handle from here */
      }
    }
    setTimeout(() => setAdded(false), 1900);
  }

  return (
    <div className={banner}>
      <ClientGlyph client={client} size={40} selected />
      <div className={main}>
        <div className={title}>Add to {label} in one click</div>
        <div className={sub}>
          {mode === "partial"
            ? "One-click sets up the connection — you may finish a step in-app."
            : `Opens ${label} and installs the connection for you.`}
        </div>
      </div>
      <DelightSpark className={action} trigger={spark} size={20}>
        <Button icon={added ? "check" : "arrow-right"} onClick={add}>
          {added ? "Added" : `Add to ${label}`}
        </Button>
      </DelightSpark>
      <span className={srOnly} role="status" aria-live="polite">
        {added ? `Added to ${label}` : ""}
      </span>
    </div>
  );
}
