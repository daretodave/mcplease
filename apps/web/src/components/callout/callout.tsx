import type { HTMLAttributes, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

type Variant = "info" | "warn" | "accent" | "bad";

// The note frame: a flex row of a leading glyph, the text column, and an optional control floated at the
// end. The hairline + surface fill is the neutral (info) look; a tone swaps in its own soft tint + line.
const rootClass = css({
  display: "flex",
  gap: "3",
  py: "[14px]",
  px: "4",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  background: "bg.surface",
});

// Per-tone skin: the soft tint fill + its matching line border. `info` keeps the neutral base, so it
// contributes nothing.
const toneClass: Record<Variant, string> = {
  info: "",
  warn: css({ background: "state.warn.soft", borderColor: "state.warn.line" }),
  accent: css({ background: "accent.soft", borderColor: "accent.line" }),
  bad: css({ background: "state.bad.soft", borderColor: "state.bad.line" }),
};

// The leading glyph wears the tone's color (info stays muted). The flex/offset are shared across tones, so
// each tone differs only by its single color atom.
const iconClass: Record<Variant, string> = {
  info: css({ flex: "[none]", marginTop: "[1px]", color: "text.muted" }),
  warn: css({ flex: "[none]", marginTop: "[1px]", color: "state.warn" }),
  accent: css({ flex: "[none]", marginTop: "[1px]", color: "accent.base" }),
  bad: css({ flex: "[none]", marginTop: "[1px]", color: "state.bad" }),
};

// The text column takes the remaining width; `minWidth: 0` lets long, unbroken content (a slug, a URL) wrap
// instead of forcing the row wider.
const mainClass = css({ flex: "[1]", minWidth: "[0]" });

const titleClass = css({
  margin: "[0 0 3px]",
  fontSize: "sm",
  fontWeight: "semibold",
  color: "text.primary",
});

// The body reads quieter than the lead; inline `<code>` gets the mono inset chip treatment.
const bodyClass = css({
  margin: "[0]",
  fontSize: "sm",
  color: "text.muted",
  lineHeight: "normal",
  "& code": {
    fontFamily: "mono",
    fontSize: "[0.92em]",
    color: "text.primary",
    background: "bg.inset",
    padding: "[1px 5px]",
    borderRadius: "[4px]",
  },
});

const asideClass = css({ flex: "[none]", display: "flex", alignItems: "center" });

// Each tone's default glyph. Override per instance with the `icon` prop.
const defaultIcon: Record<Variant, IconName> = {
  info: "info",
  warn: "alert-triangle",
  accent: "sparkle",
  bad: "alert-triangle",
};

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** The note's tone — sets the tint, the line, and the default glyph. Defaults to `info`. */
  variant?: Variant;
  /** Override the leading glyph (otherwise it follows the tone). */
  icon?: IconName;
  /** The bold lead line above the body. */
  title?: ReactNode;
  /** A control floated at the end of the row (e.g. a copy button). */
  action?: ReactNode;
}

/**
 * A tinted, bordered note. Its load-bearing use is the one-time edit-link warning on the success screen:
 * the link is shown once and can't be recovered, so we say so plainly in the `warn` tone. Each tone pairs a
 * soft tint with a matching glyph and line; `warn` and `bad` carry real urgency, so they announce
 * themselves to assistive tech as alerts.
 */
export function Callout({
  variant = "info",
  icon,
  title,
  action,
  className,
  children,
  ...rest
}: CalloutProps) {
  const glyph = icon ?? defaultIcon[variant];
  const urgent = variant === "warn" || variant === "bad";
  return (
    <div
      className={cx(rootClass, toneClass[variant], className)}
      role={urgent ? "alert" : undefined}
      {...rest}
    >
      <Icon name={glyph} size={18} className={iconClass[variant]} />
      <div className={mainClass}>
        {title != null && <p className={titleClass}>{title}</p>}
        <div className={bodyClass}>{children}</div>
      </div>
      {action != null && <div className={asideClass}>{action}</div>}
    </div>
  );
}
