import type { CSSProperties } from "react";
import { css, cx } from "../../../styled-system/css";
import { getClient, type ClientId } from "@mcplease/client-matrix";

// Our own monogram tile for a connect target — deliberately NOT a client logo. We resemble each client's
// menu, we don't reproduce its trademark, so a target is told apart by its two-letter mono code plus the
// always-visible name beside it (the picker tile, the one-click banner). One neutral palette for every
// client; only the selected state recolors. (Resemblance, not reproduction.)

// The two-letter code per client — the only per-client visual difference, and it lives here (the matrix is
// the structural source of truth and carries no glyph).
const CODE: Record<ClientId, string> = {
  "claude-code": "cc",
  "claude-desktop": "cd",
  chatgpt: "gp",
  cursor: "cu",
  vscode: "vs",
  windsurf: "ws",
  cline: "cn",
  zed: "zd",
  goose: "go",
  generic: "{}",
};

const base = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "none",
  borderRadius: "md",
  fontFamily: "mono",
  fontWeight: "medium",
  letterSpacing: "[-0.03em]",
  lineHeight: "[1]",
  userSelect: "none",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  background: "bg.raised",
  color: "text.primary",
  "&[data-selected=true]": {
    borderColor: "accent.line",
    background: "accent.soft",
    color: "accent.text",
  },
});

export interface ClientGlyphProps {
  /** The client whose monogram to show. */
  client?: ClientId;
  /** Override the monogram text. */
  code?: string;
  /** A11y label; when given the glyph is labelled, otherwise it's decorative (the tile names it). */
  label?: string;
  /** px square. */
  size?: number;
  /** Tint accent when the client is the chosen one. */
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The neutral mono monogram for a client. Decorative by default — pass `label` only when it stands without
 * an adjacent name. The monogram scales to `size`; the selected state tints it accent.
 */
export function ClientGlyph({
  client,
  code,
  label,
  size = 36,
  selected = false,
  className,
  style,
}: ClientGlyphProps) {
  const text = code ?? (client ? CODE[client] : undefined) ?? "?";
  const labelled = typeof label === "string" && label.length > 0;
  const aria = labelled ? label : ((client && getClient(client)?.label) ?? client ?? "client");
  return (
    <span
      role={labelled ? "img" : undefined}
      aria-label={labelled ? aria : undefined}
      aria-hidden={labelled ? undefined : true}
      data-selected={selected || undefined}
      className={cx(base, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34), ...style }}
    >
      {text}
    </span>
  );
}
