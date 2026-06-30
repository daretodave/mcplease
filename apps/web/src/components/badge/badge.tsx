import type { HTMLAttributes, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

// A small pill label. It carries the transport chip (`http` / `stdio`) beside a share title, the slug in the
// not-found state, short status words, and the footer's MIT tag. Semantic colors never run alone — pair the
// state variants with the icon, the dot, or the word itself, so the meaning survives without the hue.

export type BadgeVariant = "neutral" | "accent" | "ok" | "bad" | "warn";

const base = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[5px]",
  whiteSpace: "nowrap",
  fontFamily: "sans",
  fontWeight: "medium",
  fontSize: "xs",
  lineHeight: "[1]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: "pill",
  padding: "[4px 9px]",
});

const tone = {
  neutral: css({ background: "bg.raised", borderColor: "border.subtle", color: "text.muted" }),
  accent: css({ background: "accent.soft", borderColor: "accent.line", color: "accent.text" }),
  ok: css({ background: "state.ok.soft", borderColor: "state.ok.line", color: "state.ok.text" }),
  bad: css({
    background: "state.bad.soft",
    borderColor: "state.bad.line",
    color: "state.bad.text",
  }),
  warn: css({
    background: "state.warn.soft",
    borderColor: "state.warn.line",
    color: "state.warn.text",
  }),
} satisfies Record<BadgeVariant, string>;

const smClass = css({ padding: "[2px 7px]", fontSize: "[11px]", gap: "[4px]" });
const monoClass = css({ fontFamily: "mono", letterSpacing: "[-0.02em]" });
const dotClass = css({
  flexShrink: "0",
  width: "[6px]",
  height: "[6px]",
  borderRadius: "round",
  background: "[currentColor]",
});

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className"> {
  /** Semantic tone. */
  variant?: BadgeVariant;
  /** `sm` is the tighter footer/inline size. */
  size?: "sm" | "md";
  /** Render the label in the mono family (for `http`/`stdio`, slugs, codes). */
  mono?: boolean;
  /** A leading glyph. */
  icon?: IconName;
  /** A leading status dot in the current text color. */
  dot?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * The one pill. `variant` sets the tone; `mono` switches the label to the code family; `icon`/`dot` add a
 * non-color signal so a state still reads in monochrome.
 */
export function Badge({
  variant = "neutral",
  size = "md",
  mono = false,
  icon,
  dot = false,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cx(base, tone[variant], size === "sm" && smClass, mono && monoClass, className)}
      {...rest}
    >
      {dot && <span className={dotClass} />}
      {icon && <Icon name={icon} size={size === "sm" ? 11 : 13} />}
      {children}
    </span>
  );
}
