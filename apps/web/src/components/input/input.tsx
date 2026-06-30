import { useId } from "react";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon } from "../icon/icon";

type Size = "sm" | "md" | "lg";
type FieldState = "default" | "ok" | "warn";

const fieldClass = css({ display: "flex", flexDirection: "column", gap: "2" });

const labelClass = css({ fontSize: "sm", fontWeight: "medium", color: "text.primary" });
const optionalClass = css({ color: "text.faint", fontWeight: "regular" });

// The bordered wrap owns every state color and takes the focus ring via :focus-within, so a prefix,
// the input, and a suffix read as a single control. data-state switches the semantic border (and its
// focus glow); data-disabled dims the whole shell and turns off pointer events.
const wrapBase = css({
  display: "flex",
  alignItems: "center",
  gap: "[0]",
  background: "bg.surface",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  transitionProperty: "[border-color, box-shadow, background]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _hover: { borderColor: "border.strong" },
  _focusWithin: { borderColor: "accent.base", boxShadow: "ring" },
  "&[data-state=ok]": { borderColor: "state.ok.line" },
  "&[data-state=ok]:focus-within": {
    borderColor: "state.ok",
    boxShadow: "[0 0 0 3px token(colors.state.ok.soft)]",
  },
  "&[data-state=error]": { borderColor: "state.bad.line" },
  "&[data-state=error]:focus-within": {
    borderColor: "state.bad",
    boxShadow: "[0 0 0 3px token(colors.state.bad.soft)]",
  },
  "&[data-state=warn]": { borderColor: "state.warn.line" },
  "&[data-state=warn]:focus-within": {
    borderColor: "state.warn",
    boxShadow: "[0 0 0 3px token(colors.state.warn.soft)]",
  },
  "&[data-disabled=true]": { opacity: "[0.55]", pointerEvents: "none" },
});

const wrapSize: Record<Size, string> = {
  sm: css({ height: "[34px]", px: "[10px]" }),
  md: css({ height: "[40px]", px: "3" }),
  lg: css({ height: "[46px]", px: "[14px]" }),
};

const inputClass = css({
  flex: "[1]",
  minWidth: "[0]",
  width: "[100%]",
  border: "[none]",
  background: "transparent",
  outline: "none",
  color: "text.primary",
  fontFamily: "sans",
  fontSize: "body",
  lineHeight: "[1.2]",
  padding: "[0]",
  _placeholder: { color: "text.faint" },
});

// In mono mode the value and the affixes switch to the code family, so URLs, slugs, and commands read
// truer (no ambiguous l/1/I, fixed advance).
const monoText = css({ fontFamily: "mono", fontSize: "code" });

const affixBase = css({
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
  color: "text.muted",
  fontSize: "body",
});
const affixPrefix = css({ paddingRight: "[1px]" });
const affixSuffix = css({ paddingLeft: "2" });

const messageClass = css({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  margin: "[0]",
  fontSize: "sm",
  color: "text.muted",
});
const messageTone: Record<"error" | "ok" | "warn", string> = {
  error: css({ color: "state.bad.text" }),
  ok: css({ color: "state.ok.text" }),
  warn: css({ color: "state.warn.text" }),
};

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  /** Field label above the control. */
  label?: ReactNode;
  /** Appends a muted "— optional" to the label. */
  optional?: boolean;
  /** Helper text below the field. */
  hint?: ReactNode;
  /** Error message (string) or flag — paints the field red and shows an alert icon. */
  error?: string | boolean;
  /** Semantic border state when not an error. */
  state?: FieldState;
  /** Inline addon before the input (e.g. the `mcplease.io/` slug prefix). */
  prefix?: ReactNode;
  /** Inline addon after the input (e.g. a status indicator). */
  suffix?: ReactNode;
  /** Render the value + affixes in the mono family. */
  mono?: boolean;
  /** Control height. */
  size?: Size;
  /** Ref to the underlying input element. */
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * The one text field. A label, hint, and error message sit around a bordered wrap that holds an
 * optional prefix affix, the input, and an optional suffix affix. The wrap owns the state colors and
 * shows the focus ring via `:focus-within`, so the affixes feel like one piece of the control. `error`
 * overrides `state`: it reddens the field, prepends an alert icon, and marks the input `aria-invalid`.
 */
export function Input({
  label,
  optional = false,
  hint,
  error,
  state = "default",
  prefix,
  suffix,
  mono = false,
  size = "md",
  disabled = false,
  id,
  className,
  inputRef,
  ...rest
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-msg`;
  const resolved = error ? "error" : state;
  const message = typeof error === "string" ? error : hint;
  const tone = error ? "error" : state === "ok" ? "ok" : state === "warn" ? "warn" : undefined;

  return (
    <div className={cx(fieldClass, className)}>
      {label && (
        <label className={labelClass} htmlFor={fieldId}>
          {label}
          {optional && <span className={optionalClass}> — optional</span>}
        </label>
      )}
      <div
        className={cx(wrapBase, wrapSize[size])}
        data-state={resolved}
        data-disabled={disabled || undefined}
      >
        {prefix && (
          <span className={cx(affixBase, affixPrefix, mono ? monoText : undefined)}>{prefix}</span>
        )}
        <input
          id={fieldId}
          ref={inputRef}
          className={cx(inputClass, mono ? monoText : undefined)}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
        {suffix && (
          <span className={cx(affixBase, affixSuffix, mono ? monoText : undefined)}>{suffix}</span>
        )}
      </div>
      {message && (
        <p id={messageId} className={cx(messageClass, tone ? messageTone[tone] : undefined)}>
          {error && <Icon name="alert-triangle" size={14} />}
          {message}
        </p>
      )}
    </div>
  );
}
