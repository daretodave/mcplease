import type { HTMLAttributes } from "react";
import { css, cx } from "../../../styled-system/css";
import { Icon } from "../icon/icon";

// The quiet footer every page wears: a small open-source / MIT note on the left, then the legal links
// (Terms, Privacy) and a link out to the source on GitHub. A top hairline sets it apart from the page
// column above it. There is no copyright line, by design — the product is open and unowned.

const footerClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "4",
  py: "4",
  borderTopWidth: "hairline",
  borderTopStyle: "solid",
  borderTopColor: "border.subtle",
  color: "text.muted",
  fontFamily: "sans",
  fontSize: "sm",
});

// The legal / license note — the faintest text in the column.
const fineClass = css({
  color: "text.faint",
});

const linksClass = css({
  display: "flex",
  alignItems: "center",
  gap: "0.5",
});

const linkClass = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "[6px]",
  py: "[6px]",
  px: "[9px]",
  borderRadius: "sm",
  color: "text.muted",
  fontWeight: "medium",
  textDecoration: "none",
  transitionProperty: "[color, background]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _hover: { color: "text.primary", background: "accent.soft", textDecoration: "none" },
  _focusVisible: { outline: "none", boxShadow: "ring" },
});

// A thin upright divider between the legal links and the source link.
const sepClass = css({
  width: "[1px]",
  height: "[18px]",
  mx: "[6px]",
  background: "border.subtle",
});

export interface FooterProps extends Omit<HTMLAttributes<HTMLElement>, "className"> {
  /** The public source repository the GitHub link opens. */
  sourceUrl?: string;
  /** Extra class merged onto the root `<footer>`. */
  className?: string;
}

/**
 * The page footer. Internal routes (Terms, Privacy) are plain in-app links; the source link points off
 * to GitHub in a new tab. The github glyph is decorative — the visible "GitHub" text carries the name.
 */
export function Footer({
  sourceUrl = "https://github.com/daretodave/mcplease",
  className,
  ...rest
}: FooterProps) {
  return (
    <footer className={cx(footerClass, className)} {...rest}>
      <span className={fineClass}>Open source · MIT</span>
      <div className={linksClass}>
        <a className={linkClass} href="/terms">
          Terms
        </a>
        <a className={linkClass} href="/privacy">
          Privacy
        </a>
        <span className={sepClass} aria-hidden="true" />
        <a className={linkClass} href={sourceUrl} target="_blank" rel="noreferrer noopener">
          <Icon name="github" size={15} /> GitHub
        </a>
      </div>
    </footer>
  );
}
