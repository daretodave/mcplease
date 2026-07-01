import { css, cx } from "../../../styled-system/css";

// A visual that resembles a terminal — the three window dots, a title, then lines. Used for the CLI-driven
// connect steps (claude-code, the stdio clone/build) and for the `/mcp` authenticate beat, where lines carry
// a status tag (connected / needs authentication) and the row the reader acts on glows.

export interface TerminalLine {
  text: string;
  /** prefix an accent `$ ` prompt */
  prompt?: boolean;
  /** trail an accent block caret */
  caret?: boolean;
  /** render the line muted (an annotation, not a typed command) */
  dim?: boolean;
  /** render as an accent heading (e.g. a menu title like "Manage MCP servers") */
  head?: boolean;
  /** highlight this line — the entry the reader acts on */
  glow?: boolean;
  /** a right-aligned status tag (e.g. "needs authentication") */
  tag?: string;
  /** the tag's tone — adds a ✓ / △ / ✕ marker so it's not colour-only */
  tagState?: "ok" | "warn" | "bad";
}

const root = css({ fontFamily: "mono", fontSize: "[12.5px]" });

const head = css({
  display: "flex",
  alignItems: "center",
  gap: "[6px]",
  padding: "[8px 12px]",
  borderBottomWidth: "hairline",
  borderBottomStyle: "solid",
  borderBottomColor: "border.subtle",
});

const dot = css({
  width: "[9px]",
  height: "[9px]",
  borderRadius: "round",
  background: "border.strong",
});
const title = css({
  marginLeft: "[6px]",
  fontSize: "[11px]",
  color: "text.faint",
  fontFamily: "sans",
});

const body = css({
  padding: "[12px 14px]",
  display: "flex",
  flexDirection: "column",
  gap: "[5px]",
  lineHeight: "[1.5]",
});

const lineBase = css({
  display: "flex",
  alignItems: "center",
  gap: "[8px]",
  color: "text.primary",
});
const lineDim = css({ color: "text.faint" });
const lineHead = css({ color: "accent.text", fontWeight: "semibold" });
const lineGlow = css({
  padding: "[5px 9px]",
  marginInline: "[-4px]",
  borderRadius: "[7px]",
  background: "accent.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
  color: "accent.text",
});
const lineText = css({
  minWidth: "[0]",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});
const mark = css({ color: "accent.text" });

const tagBase = css({
  marginLeft: "auto",
  flexShrink: "0",
  display: "inline-flex",
  alignItems: "center",
  gap: "[5px]",
  fontSize: "[11px]",
});
const tagOk = css({ color: "state.ok.text" });
const tagWarn = css({ color: "state.warn.text" });
const tagBad = css({ color: "state.bad.text" });

const TAG_MARK = { ok: "✓", warn: "△", bad: "✕" } as const;
const TAG_TONE = { ok: tagOk, warn: tagWarn, bad: tagBad } as const;

export interface TerminalMockProps {
  title?: string;
  lines?: TerminalLine[];
}

/** The terminal resemblance for a step's visual. */
export function TerminalMock({ title: titleText = "Terminal", lines = [] }: TerminalMockProps) {
  return (
    <div className={root}>
      <div className={head}>
        <span className={dot} />
        <span className={dot} />
        <span className={dot} />
        <span className={title}>{titleText}</span>
      </div>
      <div className={body}>
        {lines.map((ln, i) => (
          <div
            key={i}
            className={cx(lineBase, ln.dim && lineDim, ln.head && lineHead, ln.glow && lineGlow)}
          >
            <span className={lineText}>
              {ln.prompt && <span className={mark}>$ </span>}
              {ln.text}
              {ln.caret && <span className={mark}>▍</span>}
            </span>
            {ln.tag && (
              <span className={cx(tagBase, ln.tagState && TAG_TONE[ln.tagState])}>
                {ln.tagState && <span aria-hidden="true">{TAG_MARK[ln.tagState]}</span>}
                {ln.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
