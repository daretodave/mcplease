import type { HTMLAttributes } from "react";
import { useEffect, useRef, useState } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon } from "../icon/icon";
import { DelightSpark } from "../delight-spark/delight-spark";

// A mono command / URL / JSON snippet in an inset well with a one-tap copy. The text lands on the
// clipboard the instant the click registers — the green check, the floating "Copied!" seal, and the
// delight spark only decorate that success, they never gate it. Multi-line text switches to a block
// layout with the copy control floated top-right; a single long line scrolls horizontally in the well.

// The well. Layout (display + padding) lives on the mutually-exclusive inline/block classes so the two
// never set the same property on the same element — only one is ever applied.
const rootBase = css({
  position: "relative",
  background: "bg.inset",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "sm",
});
const rootInline = css({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  pl: "3",
  pr: "[6px]",
  py: "1",
});
const rootBlock = css({
  display: "block",
  p: "3",
});

// The code line: grows and shrinks to fit the row, scrolls horizontally when a single command overruns.
const codeBase = css({
  flex: "[1]",
  minWidth: "[0]",
  margin: "[0]",
  px: "[0]",
  overflowX: "auto",
  fontFamily: "mono",
  fontSize: "code",
  lineHeight: "normal",
  color: "text.primary",
  whiteSpace: "pre",
  "&::-webkit-scrollbar": { height: "[6px]" },
  "&::-webkit-scrollbar-thumb": { background: "border.strong", borderRadius: "[99px]" },
});
const codeInline = css({ py: "[6px]" });
const codeBlock = css({ py: "[0]" });

// The unselectable shell sigil — present for the eye, absent from the copied text.
const promptClass = css({ color: "text.faint", userSelect: "none" });

// Anchors the copy control + its seal: a tight box in the inline row, floated to the corner in a block.
const copyWrapBase = css({ flex: "[none]", display: "inline-flex" });
const copyWrapInline = css({ position: "relative" });
const copyWrapBlock = css({ position: "absolute", top: "2", right: "2" });

const copyButton = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "[30px]",
  width: "[30px]",
  flexShrink: "0",
  padding: "[0]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: "md",
  background: "transparent",
  color: "text.muted",
  cursor: "pointer",
  transitionProperty: "[background, border-color, color, transform]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _focusVisible: { outline: "none", boxShadow: "ring" },
  // A successful copy turns the glyph the OK green; the hover tint is suppressed while it shows so the
  // confirmation reads as one clean colour.
  "&:not([data-copied=true]):hover": { background: "accent.soft", color: "text.primary" },
  _active: { transform: "[translateY(0.5px)]" },
  "&[data-copied=true]": { color: "state.ok" },
});

// The floating seal that announces the copy to assistive tech as well as the eye.
const copiedSeal = css({
  position: "absolute",
  bottom: "[calc(100% + 10px)]",
  left: "[50%]",
  transform: "[translateX(-50%)]",
  whiteSpace: "nowrap",
  px: "[9px]",
  py: "[3px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "pill",
  background: "bg.raised",
  color: "state.ok.text",
  fontFamily: "sans",
  fontSize: "xs",
  fontWeight: "medium",
  letterSpacing: "[-0.01em]",
  boxShadow: "card",
});

const COPY_ICON_SIZE = 15;
const REVERT_MS = 1600;

export interface CommandBlockProps extends Omit<HTMLAttributes<HTMLDivElement>, "className"> {
  /** The exact text copied to the clipboard. */
  command: string;
  /** Prepend a muted, unselectable `$ ` to a single-line shell command (never part of the copied text). */
  prompt?: boolean;
  /** Force the block layout (copy control top-right). Auto-on when the command contains a newline. */
  block?: boolean;
  /** Accessible label for the copy control. */
  label?: string;
  /** Fired with the copied text once the write is issued — the hook for the copy analytics event. */
  onCopied?: (command: string) => void;
}

/**
 * Best-effort, non-blocking clipboard write — the success UI never waits on it. The optional chain
 * no-ops when the API is absent; the catch swallows a rejected write (e.g. a denied permission) so a
 * copy failure never surfaces as an error.
 */
function writeClipboard(text: string) {
  // The DOM types call `navigator.clipboard` always-present, but it is absent in insecure contexts and
  // older browsers — treat it as maybe-undefined so the guard is real, not just decorative.
  const clipboard = navigator.clipboard as Clipboard | undefined;
  void clipboard?.writeText(text).catch(() => {});
}

/**
 * A mono command / JSON snippet in an inset well with a copy button. The copy is instant and
 * non-blocking; the spark and the "Copied!" seal decorate the success, then it reverts to idle.
 */
export function CommandBlock({
  command,
  prompt = false,
  block = false,
  label = "Copy command",
  onCopied,
  ...rest
}: CommandBlockProps) {
  const [copied, setCopied] = useState(false);
  const [spark, setSpark] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiline = block || command.includes("\n");

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function copy() {
    writeClipboard(command); // on the clipboard the moment the click registers
    setCopied(true);
    setSpark((n) => n + 1);
    onCopied?.(command);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), REVERT_MS);
  }

  return (
    <div className={cx(rootBase, multiline ? rootBlock : rootInline)} {...rest}>
      <pre className={cx(codeBase, multiline ? codeBlock : codeInline)}>
        <code>
          {prompt && !multiline ? <span className={promptClass}>$ </span> : null}
          {command}
        </code>
      </pre>
      <span className={cx(copyWrapBase, multiline ? copyWrapBlock : copyWrapInline)}>
        <DelightSpark trigger={spark}>
          <button
            type="button"
            className={copyButton}
            aria-label={copied ? "Copied" : label}
            data-copied={copied ? "true" : undefined}
            onClick={copy}
          >
            <Icon name={copied ? "check" : "copy"} size={COPY_ICON_SIZE} />
          </button>
        </DelightSpark>
        {copied ? (
          <span className={copiedSeal} role="status" aria-live="polite">
            Copied!
          </span>
        ) : null}
      </span>
    </div>
  );
}
