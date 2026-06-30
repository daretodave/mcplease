import { useEffect, useRef, useState } from "react";
import { css } from "../../../styled-system/css";
import { Button } from "../../components/button/button";
import { Callout } from "../../components/callout/callout";
import { CommandBlock } from "../../components/command-block/command-block";
import { DelightSpark } from "../../components/delight-spark/delight-spark";
import { Icon } from "../../components/icon/icon";
import { IconButton } from "../../components/icon-button/icon-button";

// The hand-off. The create succeeded, so this dialog gives the author the two things that matter: the share
// link to send anyone, and the edit link — shown here ONCE and never recoverable (the database keeps only
// its hash). That is why "View my connect page" stays disabled until they tick the box that says they've
// saved it: the gate is the product being honest that we cannot get this link back for them.

// The controls keyboard focus is allowed to land on while the dialog is open — disabled controls (the gated
// "View" button before it is acknowledged) are excluded, so the trap adapts as the form changes.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const backdrop = css({
  position: "fixed",
  inset: "[0]",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "5",
  zIndex: "[50]",
  background: { base: "[rgba(8,9,12,0.62)]", _light: "[rgba(20,23,28,0.38)]" },
  backdropFilter: "[blur(6px)]",
  animation: "fade 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
});

// A real, keyboard-activatable dismiss surface filling the backdrop behind the card — clicking outside the
// dialog closes it, without the a11y pitfalls of a click handler on a bare div.
const backdropClose = css({
  position: "absolute",
  inset: "[0]",
  width: "[100%]",
  height: "[100%]",
  padding: "[0]",
  border: "[none]",
  background: "transparent",
  cursor: "default",
});

const card = css({
  position: "relative",
  width: "[100%]",
  maxWidth: "[470px]",
  maxHeight: "[calc(100dvh - 48px)]",
  overflowY: "auto",
  background: "bg.raised",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "lg",
  boxShadow: "raised",
  padding: "6",
  outline: "[none]",
  animation: "pop 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)",
});

const closeSlot = css({ position: "absolute", top: "3", right: "3" });

const iconBubble = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[46px]",
  height: "[46px]",
  borderRadius: "round",
  background: "accent.soft",
  color: "accent.base",
  marginBottom: "4",
});

const titleClass = css({
  margin: "[0 0 6px]",
  fontSize: "h3",
  fontWeight: "semibold",
  letterSpacing: "[-0.01em]",
  color: "text.primary",
});

const subClass = css({
  margin: "[0 0 22px]",
  fontSize: "[14px]",
  lineHeight: "normal",
  color: "text.muted",
});

const labelClass = css({
  display: "block",
  margin: "[18px 0 8px]",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "caps",
  textTransform: "uppercase",
  color: "text.faint",
});

const mintHint = css({
  margin: "[8px 0 0]",
  fontSize: "sm",
  lineHeight: "snug",
  color: "text.muted",
  "& code": {
    fontFamily: "mono",
    color: "text.primary",
    background: "bg.inset",
    padding: "[1px 5px]",
    borderRadius: "[4px]",
  },
});

const editPanel = css({ display: "flex", flexDirection: "column", gap: "3", marginTop: "4" });
const editWarn = css({ margin: "[0]", fontSize: "sm", lineHeight: "snug", color: "text.muted" });

const ackRow = css({
  display: "flex",
  alignItems: "flex-start",
  gap: "2",
  fontSize: "sm",
  lineHeight: "snug",
  color: "text.primary",
  cursor: "pointer",
  userSelect: "none",
});

const ackBox = css({
  flexShrink: "0",
  width: "[16px]",
  height: "[16px]",
  marginTop: "[1px]",
  accentColor: "accent.base",
  cursor: "pointer",
});

const footerSlot = css({ marginTop: "5" });

export interface SuccessOverlayProps {
  /** The live slug (minted or claimed). */
  slug: string;
  /** The one-time edit URL, edit token embedded — shown here once, never stored in the clear. */
  editUrl: string;
  /** True when the slug was minted because the author left the claim blank. */
  autoMinted: boolean;
  /** Dismiss the dialog (the author can return to the form). */
  onClose: () => void;
  /** Proceed to the connect page for this slug. */
  onView: () => void;
}

/**
 * The success dialog shown the instant a link is created. The "View my connect page" button is gated behind
 * the saved-my-edit-link acknowledgment, because the edit link cannot be recovered once this closes.
 */
export function SuccessOverlay({
  slug,
  editUrl,
  autoMinted,
  onClose,
  onView,
}: SuccessOverlayProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${window.location.origin}/${slug}`;

  // Focus the dialog once on open, and hand focus back to whatever opened it when it closes. This runs
  // EXACTLY once — keying it on a prop that changes every parent render would re-steal focus mid-interaction
  // (e.g. when the background Turnstile token expires and re-renders the page).
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();
    return () => opener?.focus();
  }, []);

  // A real modal: keep keyboard focus inside the card, and close on Escape. The handler reads the latest
  // onClose through a ref, so it never has to re-bind (and never disturbs the focus effect above).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !cardRef.current) return;
      const focusables = cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === cardRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={backdrop}>
      <button type="button" aria-label="Close" className={backdropClose} onClick={onClose} />
      <div
        ref={cardRef}
        className={card}
        role="dialog"
        aria-modal="true"
        aria-label="Your link is live"
        tabIndex={-1}
      >
        <div className={closeSlot}>
          <IconButton icon="x" label="Close" size="sm" onClick={onClose} />
        </div>

        <DelightSpark trigger={1} size={22}>
          <span className={iconBubble}>
            <Icon name="check" size={24} />
          </span>
        </DelightSpark>

        <h2 className={titleClass}>Your link is live</h2>
        <p className={subClass}>
          Share it anywhere — whoever opens it picks their client and follows pictures.
        </p>

        <span className={labelClass}>Your share link</span>
        <CommandBlock command={shareUrl} label="Copy share link" />
        {autoMinted ? (
          <p className={mintHint}>
            Using <code>{slug}</code> — claim a custom slug anytime from your edit link.
          </p>
        ) : null}

        <Callout variant="warn" icon="key" title="Save your edit link">
          <div className={editPanel}>
            <p className={editWarn}>
              This is the <strong>only way back in</strong>. We can’t recover it for you.
            </p>
            <CommandBlock command={editUrl} label="Copy edit link" block />
            <label className={ackRow}>
              <input
                type="checkbox"
                className={ackBox}
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              I’ve saved my edit link — I know it can’t be recovered.
            </label>
          </div>
        </Callout>

        <div className={footerSlot}>
          <Button
            block
            size="lg"
            iconTrailing="arrow-right"
            disabled={!acknowledged}
            onClick={onView}
          >
            View my connect page
          </Button>
        </div>
      </div>
    </div>
  );
}
