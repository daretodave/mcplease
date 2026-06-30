import { css, cx } from "../../../styled-system/css";

// A visual that resembles a terminal — the three window dots, a title, then prompt lines. Used for the
// CLI-driven connect steps (claude-code, vscode's `code --add-mcp`, the stdio clone/build).

export interface TerminalLine {
  text: string;
  /** prefix an accent `$ ` prompt */
  prompt?: boolean;
  /** trail an accent block caret */
  caret?: boolean;
  /** render the line muted (an annotation, not a typed command) */
  dim?: boolean;
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

const line = css({ color: "text.primary" });
const lineDim = css({ color: "text.faint" });
const mark = css({ color: "accent.text" });

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
          <div key={i} className={cx(line, ln.dim && lineDim)}>
            {ln.prompt && <span className={mark}>$ </span>}
            {ln.text}
            {ln.caret && <span className={mark}>▍</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
