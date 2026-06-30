import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { CommandBlock } from "../command-block/command-block";

// One step of the image-driven instructions. It pairs a visual that resembles the client's own menu with
// the action, an optional inline-code description, and the copy-paste command. The reader's UI is the hero —
// we show their menu, not our words.

const card = css({
  display: "flex",
  flexDirection: "column",
  gap: "4",
  background: "bg.surface",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "lg",
  boxShadow: "card",
  padding: "5",
});

const head = css({ display: "flex", gap: "3", alignItems: "flex-start" });

const num = css({
  flexShrink: "0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[26px]",
  height: "[26px]",
  marginTop: "[1px]",
  borderRadius: "pill",
  background: "accent.soft",
  color: "accent.text",
  fontFamily: "mono",
  fontWeight: "semibold",
  fontSize: "sm",
});

const headText = css({ flex: "[1]", minWidth: "[0]" });

const titleClass = css({
  margin: "[0]",
  fontSize: "h3",
  fontWeight: "semibold",
  letterSpacing: "[-0.01em]",
  color: "text.primary",
  lineHeight: "[1.3]",
});

const descClass = css({
  margin: "[4px 0 0]",
  fontSize: "sm",
  color: "text.muted",
  lineHeight: "[1.5]",
  "& code": {
    fontFamily: "mono",
    fontSize: "[0.92em]",
    color: "text.primary",
    background: "bg.inset",
    padding: "[1px 5px]",
    borderRadius: "[4px]",
  },
});

const visualFrame = css({
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  background: "bg.raised",
  overflow: "hidden",
});

export interface StepCardProps {
  /** 1-based step number; omit for a single unnumbered step. */
  index?: number;
  title: ReactNode;
  /** Inline `<code>` is styled; a string renders as a paragraph, a node as a div. */
  description?: ReactNode;
  /** The client-resembling visual (a `*Mock`). */
  visual?: ReactNode;
  /** The copy-paste command/JSON. */
  command?: string;
  /** Prefix a `$ ` prompt on a single-line command. */
  prompt?: boolean;
  /** Force the block (multi-line) command layout. */
  block?: boolean;
  /** Fired with the copied text — the hook for `track.copyCommand`. */
  onCopied?: (command: string) => void;
}

/** A numbered instruction step: heading, the resembling visual, and the copy-paste command. */
export function StepCard({
  index,
  title,
  description,
  visual,
  command,
  prompt = false,
  block = false,
  onCopied,
}: StepCardProps) {
  return (
    <div className={card}>
      <div className={head}>
        {index != null && <span className={num}>{index}</span>}
        <div className={headText}>
          <h3 className={titleClass}>{title}</h3>
          {description != null &&
            (typeof description === "string" ? (
              <p className={descClass}>{description}</p>
            ) : (
              <div className={descClass}>{description}</div>
            ))}
        </div>
      </div>
      {visual && <div className={visualFrame}>{visual}</div>}
      {command && (
        <CommandBlock command={command} prompt={prompt} block={block} onCopied={onCopied} />
      )}
    </div>
  );
}
