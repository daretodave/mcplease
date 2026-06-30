import { css, cx } from "../../../styled-system/css";
import type { LinkKind } from "@mcplease/model";
import { Mark } from "../logo/logo";

// The embeddable GitHub-shield-style badge — shields.io grammar (a rounded two-segment pill) in our palette,
// so it reads with npm-badge muscle memory. The left segment is constant (mark + "MCP"); the right varies.
// The whole badge links to /<slug>. Production serves the real SVG at /badge/<slug>.svg; this is the in-app
// preview the Add-a-badge panel shows.

const shield = css({
  display: "inline-flex",
  alignItems: "stretch",
  height: "[22px]",
  verticalAlign: "middle",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "[5px]",
  overflow: "hidden",
  boxShadow: "card",
  fontFamily: "sans",
  fontSize: "[11px]",
  fontWeight: "semibold",
  lineHeight: "[1]",
  textDecoration: "none",
});

const shieldLink = css({ _hover: { filter: "[brightness(1.06)]" } });

const seg = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[5px]",
  padding: "[0 9px]",
  whiteSpace: "nowrap",
});

const segLeft = css({ background: "bg.raised", color: "text.primary" });
const segConnect = css({ background: "accent.base", color: "accent.fg" });
const segNeutral = css({ background: "bg.inset", color: "text.muted" });
const segMono = css({ fontFamily: "mono", letterSpacing: "[-0.02em]" });
const nameClass = css({ maxWidth: "[150px]", overflow: "hidden", textOverflow: "ellipsis" });
const dotClass = css({ color: "text.faint" });

export type ReadmeBadgeVariant = "connect" | "info" | "notFound";

export interface ReadmeBadgeProps {
  /** Which shield to show. */
  variant?: ReadmeBadgeVariant;
  /** Server name for the `info` variant. */
  name?: string;
  /** Transport for the `info` variant. */
  transport?: LinkKind;
  /** Overrides the right-segment text (connect / notFound). */
  label?: string;
  /** When set, the badge is an anchor to the connect page. */
  href?: string;
  className?: string;
}

/** The two-segment connect shield. `connect` is the accent CTA; `info` shows name · transport; `notFound`
 *  is the neutral degraded state a removed link renders. */
export function ReadmeBadge({
  variant = "connect",
  name = "my-server",
  transport = "http",
  label,
  href,
  className,
}: ReadmeBadgeProps) {
  const right =
    variant === "info" ? (
      <span className={cx(seg, segNeutral, segMono)}>
        <span className={nameClass}>{name}</span>
        <span className={dotClass}>·</span>
        {transport}
      </span>
    ) : variant === "notFound" ? (
      <span className={cx(seg, segNeutral)}>{label ?? "link not found"}</span>
    ) : (
      <span className={cx(seg, segConnect)}>{label ?? "Connect to MCP"}</span>
    );

  const content = (
    <>
      <span className={cx(seg, segLeft)}>
        <Mark size={13} />
        <span>MCP</span>
      </span>
      {right}
    </>
  );

  return href ? (
    <a className={cx(shield, shieldLink, className)} href={href} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <span className={cx(shield, className)}>{content}</span>
  );
}
