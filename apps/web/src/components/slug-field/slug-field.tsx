import { useId, type ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";
import { Input } from "../input/input";

// The slug claim field — a mono text input fronted by the `mcplease.io/` prefix, with a live status line
// underneath. Availability is decided upstream (a debounced server lookup) and handed back in as `status`;
// this component is pure presentation, no fetching of its own. Every state pairs an icon with a word, so
// available/taken never reads on color alone. Keystrokes are lowercased on the way up — slugs are lowercase.

export type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export interface SlugFieldProps {
  value: string;
  /** Drives the indicator + message; availability is the caller's debounced server check. */
  status: SlugStatus;
  /** Called with the already-lowercased value. */
  onChange: (value: string) => void;
  prefix?: string;
  label?: string;
}

type Tone = "muted" | "ok" | "bad" | "warn";

interface StatusInfo {
  icon: IconName;
  tone: Tone;
  /** spin the glyph while a check is in flight */
  spin?: boolean;
  /** border treatment for the field (the red "error" border is a separate flag) */
  inputState: "default" | "ok" | "warn";
  error: boolean;
  word: ReactNode;
}

const STATUS: Record<Exclude<SlugStatus, "idle">, StatusInfo> = {
  checking: {
    icon: "loader",
    tone: "muted",
    spin: true,
    inputState: "default",
    error: false,
    word: "checking…",
  },
  available: {
    icon: "check",
    tone: "ok",
    inputState: "ok",
    error: false,
    word: (
      <>
        <strong>available</strong>
        {" — it’s yours"}
      </>
    ),
  },
  taken: {
    icon: "x",
    tone: "bad",
    inputState: "default",
    error: true,
    word: (
      <>
        <strong>taken</strong>
        {" — try another"}
      </>
    ),
  },
  invalid: {
    icon: "alert-triangle",
    tone: "warn",
    inputState: "warn",
    error: false,
    word: "letters, numbers and dashes; 2–40 characters",
  },
};

const field = css({ display: "flex", flexDirection: "column", gap: "2" });

const statusRow = css({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  margin: "[0]",
  minHeight: "[18px]",
  fontSize: "sm",
  "& strong": { fontWeight: "semibold" },
});

// Per-tone color: the worded row takes the deepened `text` variant; the inline field glyph takes the solid.
const tones: Record<Tone, { text: string; solid: string }> = {
  muted: { text: css({ color: "text.muted" }), solid: css({ color: "text.muted" }) },
  ok: { text: css({ color: "state.ok.text" }), solid: css({ color: "state.ok" }) },
  bad: { text: css({ color: "state.bad.text" }), solid: css({ color: "state.bad" }) },
  warn: { text: css({ color: "state.warn.text" }), solid: css({ color: "state.warn" }) },
};

const spinClass = css({ animation: "spin 0.7s linear infinite" });

export function SlugField({
  value,
  status,
  onChange,
  prefix = "mcplease.io/",
  label = "Claim your slug — optional",
}: SlugFieldProps) {
  const statusId = useId();
  // The status row only appears once there's something to judge.
  const info = value !== "" && status !== "idle" ? STATUS[status] : null;
  const tone: Tone = info ? info.tone : "muted";

  const suffix = info ? (
    <Icon
      name={info.icon}
      size={16}
      className={cx(tones[tone].solid, info.spin ? spinClass : undefined)}
    />
  ) : null;

  return (
    <div className={field}>
      <Input
        label={label}
        prefix={prefix}
        mono
        value={value}
        onChange={(e) => onChange(e.target.value.toLowerCase())}
        suffix={suffix}
        error={info?.error ?? false}
        state={info?.inputState ?? "default"}
        placeholder="my-server"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-describedby={statusId}
      />
      <p id={statusId} aria-live="polite" className={cx(statusRow, tones[tone].text)}>
        {info ? (
          <>
            <Icon name={info.icon} size={14} className={info.spin ? spinClass : undefined} />
            {info.word}
          </>
        ) : (
          "Leave it blank and we’ll mint a friendly one."
        )}
      </p>
    </div>
  );
}
