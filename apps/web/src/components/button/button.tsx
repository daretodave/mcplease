import type { ButtonHTMLAttributes, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "transparent",
  borderRadius: "md",
  fontFamily: "sans",
  fontWeight: "semibold",
  letterSpacing: "[-0.01em]",
  lineHeight: "[1]",
  cursor: "pointer",
  userSelect: "none",
  whiteSpace: "nowrap",
  textDecoration: "none",
  transitionProperty: "[background, border-color, color, box-shadow, transform]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _focusVisible: { outline: "none", boxShadow: "ring" },
  "&:disabled, &[aria-disabled=true]": {
    opacity: "[0.5]",
    cursor: "not-allowed",
    pointerEvents: "none",
  },
});

const variantClass: Record<Variant, string> = {
  primary: css({
    background: "accent.base",
    color: "accent.fg",
    _hover: { background: "accent.hover", boxShadow: "glow" },
    _active: { background: "accent.active", transform: "[translateY(0.5px)]", boxShadow: "[none]" },
  }),
  secondary: css({
    background: "bg.surface",
    color: "text.primary",
    borderColor: "border.subtle",
    _hover: { background: "bg.raised", borderColor: "border.strong" },
    _active: { transform: "[translateY(0.5px)]" },
  }),
  ghost: css({
    background: "transparent",
    color: "text.muted",
    _hover: { background: "accent.soft", color: "text.primary" },
    _active: { transform: "[translateY(0.5px)]" },
  }),
};

const sizeClass: Record<Size, string> = {
  sm: css({ height: "[32px]", px: "3", fontSize: "sm", gap: "[6px]" }),
  md: css({ height: "[40px]", px: "4", fontSize: "body", gap: "2" }),
  lg: css({ height: "[48px]", px: "[22px]", fontSize: "body", gap: "[9px]" }),
};

const blockClass = css({ width: "[100%]" });
const spinClass = css({ animation: "spin 0.7s linear infinite" });
const iconSize: Record<Size, number> = { sm: 15, md: 16, lg: 18 };

interface BaseProps {
  variant?: Variant;
  size?: Size;
  /** a leading glyph */
  icon?: IconName;
  /** a trailing glyph (hidden while loading) */
  iconTrailing?: IconName;
  /** swap the leading glyph for a spinner and disable */
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & { href?: undefined };
type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

/**
 * The one button. A real `<button>`, or an `<a>` when given `href` (so a link that looks like a button
 * stays a link). The single accent carries the primary action; `loading` shows the spinner and blocks
 * input while the click's work runs.
 */
export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = "primary",
    size = "md",
    icon,
    iconTrailing,
    loading = false,
    block = false,
    children,
    ...rest
  } = props;
  const cls = cx(base, variantClass[variant], sizeClass[size], block ? blockClass : undefined);
  const isz = iconSize[size];
  const inner = (
    <>
      {loading ? (
        <Icon name="loader" size={isz} className={spinClass} />
      ) : icon ? (
        <Icon name={icon} size={isz} />
      ) : null}
      {children != null && <span>{children}</span>}
      {!loading && iconTrailing ? <Icon name={iconTrailing} size={isz} /> : null}
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    return (
      <a className={cls} {...rest}>
        {inner}
      </a>
    );
  }
  const { disabled, ...buttonRest } = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  const isDisabled = disabled === true || loading;
  return (
    <button
      type="button"
      className={cls}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {inner}
    </button>
  );
}
