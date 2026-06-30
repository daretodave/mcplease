import type { HTMLAttributes, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon } from "../icon/icon";

// The anchor: a tight inline box that gives the spark a positioning context without disturbing the
// control it wraps.
const anchorClass = css({
  position: "relative",
  display: "inline-flex",
});

// The signature delight beat — a single accent spark that blooms up out of the control and fades, just
// over a second, then it's gone. It's the one moment the accent moves: purely decorative (the copy or
// connect has already happened), so it's hidden from assistive tech and never intercepts a pointer.
// Centered on the anchor, it rises and lifts away via the sparkBloom keyframe; under reduced motion that
// keyframe is neutralized globally, so the spark simply holds still — harmless, never blocking a render.
const sparkClass = css({
  position: "absolute",
  left: "[50%]",
  top: "[50%]",
  pointerEvents: "none",
  color: "accent.base",
  filter: "[drop-shadow(0 0 6px token(colors.accent.line))]",
  animation: "sparkBloom 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
});

export interface DelightSparkProps extends HTMLAttributes<HTMLSpanElement> {
  /** A counter — bump it (e.g. `n + 1`) to replay the bloom once; `0`/falsy shows nothing. */
  trigger?: number;
  /** Spark glyph size in px. */
  size?: number;
  children?: ReactNode;
}

/**
 * The locked delight beat: wrap a control, then bump `trigger` at the moment of success and a single
 * accent spark blooms up and vanishes (just over a second, non-blocking). It's the one place the accent
 * moves, and it's decorative — pair it with a static "Copied!" seal so the confirmation still lands when
 * motion is off. Children always render; the spark only mounts while `trigger` is truthy, and each new
 * value remounts it so the bloom replays from the top.
 */
export function DelightSpark(props: DelightSparkProps) {
  const { trigger = 0, size = 18, children, className, ...rest } = props;
  return (
    <span className={cx(anchorClass, className)} {...rest}>
      {children}
      {trigger ? (
        <span key={trigger} className={sparkClass} aria-hidden="true">
          <Icon name="sparkle" size={size} />
        </span>
      ) : null}
    </span>
  );
}
