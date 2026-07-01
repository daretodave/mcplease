import { css, cx } from "../../../styled-system/css";
import { Icon, type IconName } from "../icon/icon";

// A tiny chip naming a beat's archetype — so the authenticate step reads as its own kind of move, not just
// another tap. Word + icon (never colour alone), so it stays legible without relying on the state tint.

export type BeatKindName = "auth" | "browser" | "add" | "run";

const chip = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[5px]",
  fontFamily: "mono",
  fontSize: "xs",
  letterSpacing: "[0.03em]",
});
const warnTone = css({ color: "state.warn.text" });
const accentTone = css({ color: "accent.text" });
const mutedTone = css({ color: "text.muted" });

const MAP: Record<BeatKindName, { label: string; icon: IconName; tone: string }> = {
  auth: { label: "authenticate", icon: "alert-triangle", tone: warnTone },
  browser: { label: "authenticate · browser", icon: "alert-triangle", tone: warnTone },
  add: { label: "add", icon: "plus", tone: accentTone },
  run: { label: "configure", icon: "terminal", tone: mutedTone },
};

export interface BeatKindProps {
  kind: BeatKindName;
}

/** The archetype chip for a storyboard beat. */
export function BeatKind({ kind }: BeatKindProps) {
  const m = MAP[kind];
  return (
    <span className={cx(chip, m.tone)}>
      <Icon name={m.icon} size={12} />
      {m.label}
    </span>
  );
}
