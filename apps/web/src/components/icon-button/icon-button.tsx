import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

type Variant = "ghost" | "secondary";
type Size = "sm" | "md" | "lg";

// Quiet by default — a transparent, muted square that warms to the accent wash on hover. The footprint is
// fixed by width/height (never padding), so the glyph sits dead-centre at every size and the box stays
// square. Same hover/active/focus language as the text Button.
const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  p: "[0]",
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
  _disabled: { opacity: "[0.5]", cursor: "not-allowed", pointerEvents: "none" },
});

const variantClass: Record<Variant, string> = {
  ghost: css({
    _hover: { background: "accent.soft", color: "text.primary" },
    _active: { transform: "[translateY(0.5px)]" },
  }),
  secondary: css({
    background: "bg.surface",
    borderColor: "border.subtle",
    color: "text.primary",
    _hover: { background: "bg.raised", borderColor: "border.strong" },
    _active: { transform: "[translateY(0.5px)]" },
  }),
};

const sizeClass: Record<Size, string> = {
  sm: css({ width: "[30px]", height: "[30px]" }),
  md: css({ width: "[36px]", height: "[36px]" }),
  lg: css({ width: "[40px]", height: "[40px]" }),
};

// A pill swaps the rounded square for a circle; declared after `base`, so its radius wins on the element.
const roundClass = css({ borderRadius: "pill" });
const spinClass = css({ animation: "spin 0.7s linear infinite" });
const iconSize: Record<Size, number> = { sm: 15, md: 17, lg: 18 };

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  /** The glyph to render (omit when passing custom `children`). */
  icon?: IconName;
  /** Accessible name — required, since an icon-only control has no visible text. Also the tooltip. */
  label: string;
  /** Visual weight. Default `ghost`. */
  variant?: Variant;
  /** Square size — `sm` 30 · `md` 36 · `lg` 40. Default `md`. */
  size?: Size;
  /** A circle instead of a rounded square. */
  round?: boolean;
  /** Swap the glyph for a spinner and disable the control. */
  loading?: boolean;
  /** Render as a link (`<a>`) rather than a `<button>`. */
  href?: string;
}

/**
 * An icon-only button for tight spots — copy controls, the dismiss `x`, the theme toggle. Becomes an
 * `<a>` when handed an `href` (so a link that looks like a button stays a link). `label` is required: it
 * supplies both the accessible name and the tooltip.
 */
export function IconButton(props: IconButtonProps) {
  const {
    icon,
    label,
    variant = "ghost",
    size = "md",
    round = false,
    loading = false,
    href,
    disabled = false,
    type = "button",
    children,
    ...rest
  } = props;

  const cls = cx(base, variantClass[variant], sizeClass[size], round ? roundClass : undefined);
  const isz = iconSize[size];
  const glyph =
    children ??
    (loading ? (
      <Icon name="loader" size={isz} className={spinClass} />
    ) : icon ? (
      <Icon name={icon} size={isz} />
    ) : null);

  if (href && !disabled && !loading) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={label}
        title={label}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {glyph}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      {...rest}
    >
      {glyph}
    </button>
  );
}
