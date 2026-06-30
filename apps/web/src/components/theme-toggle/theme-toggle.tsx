import type { ButtonHTMLAttributes } from "react";
import { useAppearance } from "../../stores/appearance";
import { IconButton } from "../icon-button/icon-button";

type Size = "sm" | "md" | "lg";
type Variant = "ghost" | "secondary";

export interface ThemeToggleProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  /** Control size, forwarded to the underlying IconButton. Default 'md'. */
  size?: Size;
  /** Visual weight, forwarded to the underlying IconButton. Default 'ghost'. */
  variant?: Variant;
  /** Fired with the theme just switched to — a hook for analytics. */
  onChange?: (theme: "dark" | "light") => void;
}

/**
 * The dark/light switch that lives in the footer. It reads the resolved theme from the appearance store
 * and shows the glyph of the theme currently in view — a sun on light, a moon on dark — while clicking
 * flips to the opposite concrete theme (so a click off "system" lands on a real choice). The accessible
 * label always names the destination, e.g. "Switch to light theme".
 */
export function ThemeToggle({
  size = "md",
  variant = "ghost",
  onChange,
  ...rest
}: ThemeToggleProps) {
  const shown = useAppearance((s) => s.resolved);
  const setPreference = useAppearance((s) => s.setPreference);
  const target = shown === "dark" ? "light" : "dark";

  return (
    <IconButton
      {...rest}
      icon={shown === "light" ? "sun" : "moon"}
      label={`Switch to ${target} theme`}
      size={size}
      variant={variant}
      onClick={() => {
        setPreference(target);
        onChange?.(target);
      }}
    />
  );
}
