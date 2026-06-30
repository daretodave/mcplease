import { useEffect, useRef, useState } from "react";
import { css } from "../../../styled-system/css";
import { Icon } from "../../components/icon/icon";
import { env } from "../../lib/env";

// The human check. In production a Cloudflare Turnstile widget renders here and hands back a token the edge
// create endpoint re-verifies with the secret — the browser's word is never trusted on its own. With no
// sitekey configured (local dev), there is nothing to render, so we show the verified affordance and pass a
// sentinel token through; the edge is still the real gate, so a dev token gets no further than a dev secret.

const DEV_TOKEN = "dev-no-turnstile";

interface TurnstileApi {
  render(
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
    },
  ): string;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// Inject the Turnstile script once for the whole app; later callers share the same load.
let scriptPromise: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove(); // drop the dead tag so a retry doesn't stack a duplicate
      scriptPromise = null; // let a later attempt retry the load
      reject(new Error("turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

const fallbackRow = css({
  display: "flex",
  alignItems: "center",
  gap: "[11px]",
  py: "3",
  px: "[14px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  background: "bg.surface",
  fontSize: "sm",
  color: "text.muted",
});

const fallbackBox = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[20px]",
  height: "[20px]",
  borderRadius: "[5px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.strong",
  background: "bg.raised",
  color: "state.ok",
});

const widgetSlot = css({ minHeight: "[65px]" });

// The check couldn't load (a blocked third party, an offline moment). Say so and offer a retry, rather than
// leaving an empty box and a submit button that is silently, permanently disabled.
const errorRow = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  py: "3",
  px: "[14px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "state.warn.line",
  borderRadius: "md",
  background: "state.warn.soft",
  fontSize: "sm",
  color: "state.warn.text",
  "& svg": { color: "state.warn" },
});

const retryButton = css({
  marginLeft: "auto",
  background: "transparent",
  border: "[none]",
  color: "accent.text",
  fontFamily: "sans",
  fontSize: "sm",
  fontWeight: "semibold",
  cursor: "pointer",
  textDecoration: "underline",
  _focusVisible: { outline: "none", boxShadow: "ring", borderRadius: "sm" },
});

export interface TurnstileProps {
  /** Called with the verification token, or null when it expires / errors and must be re-solved. */
  onVerify: (token: string | null) => void;
}

/**
 * The Turnstile verification row. Pass a stable `onVerify` (a state setter is ideal) — it runs once to
 * mount the widget and again whenever the token arrives, expires, or errors.
 */
export function Turnstile({ onVerify }: TurnstileProps) {
  const sitekey = env.turnstileSitekey;
  const slot = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // Bumped by Retry to re-run the effect and re-attempt the script load.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // No sitekey: nothing to render, so hand the sentinel straight through for local dev.
    if (!sitekey) {
      onVerify(DEV_TOKEN);
      return;
    }
    let widgetId: string | undefined;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        if (cancelled || !slot.current || !window.turnstile) return;
        widgetId = window.turnstile.render(slot.current, {
          sitekey,
          callback: (token) => onVerify(token),
          "expired-callback": () => onVerify(null),
          "error-callback": () => onVerify(null),
          theme: "auto",
        });
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        onVerify(null);
      });
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [sitekey, onVerify, reloadKey]);

  if (!sitekey) {
    return (
      <div className={fallbackRow}>
        <span className={fallbackBox}>
          <Icon name="check" size={13} />
        </span>
        You’re human — verified by Turnstile
      </div>
    );
  }
  if (loadFailed) {
    return (
      <div className={errorRow} role="alert">
        <Icon name="alert-triangle" size={16} />
        <span>Couldn’t load the human-check.</span>
        <button
          type="button"
          className={retryButton}
          onClick={() => {
            setLoadFailed(false);
            setReloadKey((k) => k + 1);
          }}
        >
          Retry
        </button>
      </div>
    );
  }
  return <div ref={slot} className={widgetSlot} />;
}
