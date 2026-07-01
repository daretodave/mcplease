import { css, cx } from "../../../styled-system/css";
import { CommandBlock } from "../../components/command-block/command-block";
import { Icon } from "../../components/icon/icon";
import { BeatKind } from "../../components/step-visual/beat-kind";
import { ConnectedCap } from "../../components/step-visual/connected-cap";
import type { Beat } from "./storyboard";

// One storyboard beat as a split view: a numbered instruction column beside the client-resembling scene it
// depicts. The instruction leads with the tap; the copy-paste payload (where there is one) sits under it; the
// scene is the picture. On a narrow screen the two stack — scene under instruction — so mobile reads top to
// bottom in order. A final "connected" row closes every storyboard on the outcome, never on "Added."

const row = css({
  display: "grid",
  gridTemplateColumns: "[1fr]",
  gap: "4",
  alignItems: "start",
  md: { gridTemplateColumns: "[minmax(0, 1fr) minmax(0, 1.05fr)]", gap: "6" },
});

const instr = css({ display: "flex", flexDirection: "column", gap: "3", minWidth: "[0]" });

const headRow = css({ display: "flex", alignItems: "flex-start", gap: "3" });

const num = css({
  flexShrink: "0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[28px]",
  height: "[28px]",
  borderRadius: "round",
  background: "accent.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
  color: "accent.text",
  fontFamily: "mono",
  fontSize: "sm",
  fontWeight: "semibold",
});
const numDone = css({
  background: "state.ok.soft",
  borderColor: "state.ok.line",
  color: "state.ok.text",
});

const titleWrap = css({
  display: "flex",
  flexDirection: "column",
  gap: "[3px]",
  paddingTop: "[2px]",
});

const codeChip = {
  fontFamily: "mono",
  fontSize: "[0.88em]",
  padding: "[1px 5px]",
  borderRadius: "sm",
  background: "bg.inset",
  color: "accent.text",
} as const;

const beatTitle = css({
  margin: "[0]",
  fontSize: "body",
  fontWeight: "semibold",
  color: "text.primary",
  lineHeight: "[1.35]",
  "& code": codeChip,
});
const beatSub = css({
  margin: "[0]",
  fontSize: "sm",
  color: "text.muted",
  lineHeight: "[1.5]",
  "& code": { fontFamily: "mono", fontSize: "[0.9em]", color: "text.primary" },
});

const noteClass = css({
  margin: "[0]",
  fontSize: "xs",
  color: "text.faint",
  lineHeight: "[1.5]",
  "& code": { fontFamily: "mono", fontSize: "[0.9em]", color: "text.muted" },
});

const kindSlot = css({ marginTop: "[-2px]" });

// The scene frame — the client-resembling picture in its own bezel.
const frame = css({
  overflow: "hidden",
  borderRadius: "lg",
  background: "bg.surface",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  boxShadow: "card",
});

const capSlot = css({ display: "flex", alignItems: "center", minHeight: "[56px]" });

export interface BeatRowProps {
  index: number;
  beat: Beat;
  onCopied?: (command: string) => void;
}

/** One storyboard beat: numbered instruction column + the scene it depicts. */
export function BeatRow({ index, beat, onCopied }: BeatRowProps) {
  return (
    <div className={row}>
      <div className={instr}>
        <div className={headRow}>
          <span className={num} aria-hidden="true">
            {index}
          </span>
          <div className={titleWrap}>
            <h3 className={beatTitle}>{beat.title}</h3>
            {beat.sub ? <p className={beatSub}>{beat.sub}</p> : null}
          </div>
        </div>
        {beat.kind ? (
          <div className={kindSlot}>
            <BeatKind kind={beat.kind} />
          </div>
        ) : null}
        {beat.copy ? (
          <CommandBlock
            command={beat.copy.text}
            prompt={beat.copy.prompt}
            block={beat.copy.block}
            onCopied={onCopied}
          />
        ) : null}
        {beat.note ? <p className={noteClass}>{beat.note}</p> : null}
      </div>
      <div className={frame}>{beat.scene}</div>
    </div>
  );
}

/** The connected cap as a final row — the storyboard ends on the outcome, not on "Added." */
export function ConnectedRow({ label }: { label: string }) {
  return (
    <div className={row}>
      <div className={instr}>
        <div className={headRow}>
          <span className={cx(num, numDone)} aria-hidden="true">
            <Icon name="check" size={15} />
          </span>
          <div className={titleWrap}>
            <h3 className={beatTitle}>Connected</h3>
            <p className={beatSub}>That’s the whole flow — it’s working now.</p>
          </div>
        </div>
      </div>
      <div className={capSlot}>
        <ConnectedCap label={label} />
      </div>
    </div>
  );
}
