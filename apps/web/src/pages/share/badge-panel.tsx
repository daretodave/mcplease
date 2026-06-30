import type { PublicLink } from "@mcplease/model";
import { useState } from "react";
import { css } from "../../../styled-system/css";
import { CommandBlock } from "../../components/command-block/command-block";
import { ReadmeBadge } from "../../components/readme-badge/readme-badge";
import { SegmentedControl } from "../../components/segmented-control/segmented-control";

// The "add a badge to your README" panel: live previews of the connect + info shields, a format switch
// (Markdown / HTML / URL), and the copyable embed — plus the honest note that a removed link degrades to a
// neutral "link not found" shield rather than a broken image.

const panel = css({
  display: "flex",
  flexDirection: "column",
  gap: "[14px]",
  padding: "5",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "lg",
  background: "bg.surface",
});

const previews = css({ display: "flex", alignItems: "center", gap: "[14px]", flexWrap: "wrap" });

const fallback = css({
  display: "flex",
  alignItems: "center",
  gap: "[10px]",
  flexWrap: "wrap",
  paddingTop: "3",
  borderTopWidth: "hairline",
  borderTopStyle: "solid",
  borderTopColor: "border.subtle",
  fontSize: "[12.5px]",
  color: "text.faint",
});

type BadgeFormat = "md" | "html" | "url";

const FORMATS = [
  { value: "md", label: "Markdown" },
  { value: "html", label: "HTML" },
  { value: "url", label: "URL" },
] as const;

const FORMAT_LABEL: Record<BadgeFormat, string> = { md: "Markdown", html: "HTML", url: "URL" };

export interface BadgePanelProps {
  link: PublicLink;
  /** Fired when the embed is copied — the hook for `track.copyBadge`. */
  onCopyBadge: () => void;
}

/** The README-badge embed panel. The previews and snippet point at the production page + badge URLs, which
 *  the edge serves the real SVG for. */
export function BadgePanel({ link, onCopyBadge }: BadgePanelProps) {
  const [format, setFormat] = useState<BadgeFormat>("md");
  const pageUrl = `https://mcplease.io/${link.slug}`;
  const svgUrl = `https://mcplease.io/badge/${link.slug}.svg`;

  const snippet: Record<BadgeFormat, string> = {
    md: `[![Connect to MCP](${svgUrl})](${pageUrl})`,
    html: `<a href="${pageUrl}">\n  <img src="${svgUrl}" alt="Connect to MCP">\n</a>`,
    url: pageUrl,
  };

  return (
    <div className={panel}>
      <div className={previews}>
        <ReadmeBadge variant="connect" href={pageUrl} />
        <ReadmeBadge
          variant="info"
          name={link.name ?? link.slug}
          transport={link.kind}
          href={pageUrl}
        />
      </div>
      <SegmentedControl
        label="Badge embed format"
        value={format}
        onChange={(value) => setFormat(value as BadgeFormat)}
        size="sm"
        options={FORMATS.map((f) => ({ ...f }))}
      />
      <CommandBlock
        command={snippet[format]}
        block={format === "html"}
        label={`Copy ${FORMAT_LABEL[format]}`}
        onCopied={onCopyBadge}
      />
      <div className={fallback}>
        <span>If your link is ever removed, the badge degrades to:</span>
        <ReadmeBadge variant="notFound" />
      </div>
    </div>
  );
}
