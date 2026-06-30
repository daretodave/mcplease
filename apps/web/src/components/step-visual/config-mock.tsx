import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";

// A visual that resembles a config-file editor — a filename tab, then pre-formatted JSON lines. Used for the
// clients you connect by editing a config (zed's context_servers, the stdio local-server block, the generic
// mcpServers snippet). Lines are real nodes (not injected HTML), so the caller highlights the server name
// with a tinted span of its own — no string injection.

const root = css({ fontFamily: "mono", fontSize: "[12.5px]" });

const head = css({
  display: "flex",
  alignItems: "center",
  gap: "[7px]",
  padding: "[8px 12px]",
  borderBottomWidth: "hairline",
  borderBottomStyle: "solid",
  borderBottomColor: "border.subtle",
  color: "text.muted",
  fontSize: "[11px]",
});

const dot = css({
  width: "[8px]",
  height: "[8px]",
  borderRadius: "[2px]",
  background: "accent.base",
});

const body = css({
  padding: "[12px 14px]",
  display: "flex",
  flexDirection: "column",
  gap: "[3px]",
  lineHeight: "[1.5]",
  color: "text.primary",
  whiteSpace: "pre",
});

export interface ConfigMockProps {
  file?: string;
  /** Each entry is one rendered line; wrap the server name in a `configAccent` span to tint it. */
  lines?: ReactNode[];
}

/** The config-editor resemblance for a step's visual. */
export function ConfigMock({ file = "config.json", lines = [] }: ConfigMockProps) {
  return (
    <div className={root}>
      <div className={head}>
        <span className={dot} />
        {file}
      </div>
      <div className={body}>
        {lines.map((ln, i) => (
          <div key={i}>{ln}</div>
        ))}
      </div>
    </div>
  );
}
