import { useRef, type HTMLAttributes, type ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

type Size = "sm" | "md" | "lg";

const track = css({
  display: "inline-flex",
  background: "bg.inset",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  p: "0.5",
  gap: "0.5",
});

// `block` stretches the row to its container; the per-option `flex` then splits it into equal segments.
const trackBlock = css({ width: "[100%]" });

const optionClass = css({
  flex: "[1]",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "[6px]",
  borderStyle: "none",
  background: "transparent",
  color: "text.muted",
  fontFamily: "sans",
  fontWeight: "medium",
  py: "[0]",
  // The thumb nests inside the track's radius, inset by the track padding.
  borderRadius: "[calc(token(radii.md) - 3px)]",
  cursor: "pointer",
  whiteSpace: "nowrap",
  // Color/fill settle quickly; the raised-thumb shadow eases in a beat slower.
  transition:
    "[color token(durations.fast) token(easings.out), background token(durations.fast) token(easings.out), box-shadow token(durations.base) token(easings.out)]",
  _hover: { background: "accent.soft", color: "text.primary" },
  _focusVisible: { outline: "none", boxShadow: "ring" },
  // The selected segment raises onto the accent surface.
  "&[aria-checked=true]": {
    background: "accent.base",
    color: "accent.fg",
    boxShadow: "card",
  },
  _disabled: { opacity: "[0.45]", cursor: "not-allowed" },
});

const optionSize: Record<Size, string> = {
  sm: css({ height: "[26px]", px: "3", fontSize: "sm" }),
  md: css({ height: "[30px]", px: "4", fontSize: "sm" }),
  lg: css({ height: "[36px]", px: "[20px]", fontSize: "body" }),
};

const noteClass = css({ color: "text.faint", fontWeight: "regular", fontSize: "xs" });

export interface SegmentOption {
  value: string;
  label: ReactNode;
  /** an optional leading glyph */
  icon?: IconName;
  /** an optional trailing muted tag, e.g. "default" */
  note?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "className"
> {
  options: SegmentOption[];
  /** the currently selected value */
  value: string;
  onChange?: (value: string) => void;
  size?: Size;
  /** stretch the segments to fill the width */
  block?: boolean;
  /** the accessible group label */
  label?: string;
}

/**
 * A segmented radio row — a compact pill switch for two or three equal choices (e.g. a transport toggle).
 * Renders a real `radiogroup` of `radio` buttons: the selected segment raises onto the accent surface, the
 * rest stay quiet. Roving `tabIndex` keeps one tab stop into the group; Left/Right (and Up/Down) move the
 * selection, wrapping at the ends and skipping disabled options.
 */
export function SegmentedControl({
  options,
  value,
  onChange,
  size = "md",
  block = false,
  label,
  ...rest
}: SegmentedControlProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function move(from: number, dir: 1 | -1) {
    const n = options.length;
    if (n === 0) return;
    let next = from;
    for (let step = 0; step < n; step += 1) {
      next = (next + dir + n) % n;
      if (!options[next]?.disabled) break;
    }
    const target = options[next];
    if (!target || target.disabled) return;
    onChange?.(target.value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(track, block ? trackBlock : undefined)}
      {...rest}
    >
      {options.map((opt, i) => {
        const checked = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={opt.disabled}
            className={cx(optionClass, optionSize[size])}
            onClick={() => {
              if (!opt.disabled) onChange?.(opt.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                move(i, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                move(i, -1);
              }
            }}
          >
            {opt.icon ? <Icon name={opt.icon} size={size === "lg" ? 16 : 14} /> : null}
            {opt.label}
            {opt.note ? <span className={noteClass}>{opt.note}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
