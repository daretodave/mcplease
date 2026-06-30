import type { ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";

// A visual that resembles a client's settings menu — a breadcrumb header and a few rows with the "click
// this" row highlighted. The reader's own UI is the instruction; we evoke its shape, never reproduce its
// chrome or logo.

export interface MenuItem {
  label: string;
  /** the highlighted row the reader should click */
  on?: boolean;
  /** a muted right-aligned hint (e.g. a count), shown only when this isn't the active row */
  right?: string;
}

const root = css({ fontFamily: "sans", fontSize: "sm", color: "text.primary" });

const head = css({
  display: "flex",
  alignItems: "center",
  gap: "[7px]",
  padding: "[9px 12px]",
  borderBottomWidth: "hairline",
  borderBottomStyle: "solid",
  borderBottomColor: "border.subtle",
  color: "text.muted",
  fontSize: "xs",
});

const headDot = css({
  width: "[9px]",
  height: "[9px]",
  borderRadius: "[3px]",
  background: "accent.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
});

const crumbSep = css({ color: "text.faint" });
const crumbCur = css({ color: "text.primary" });

const body = css({ padding: "2", display: "flex", flexDirection: "column", gap: "[2px]" });

const itemBase = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "2",
  padding: "[8px 10px]",
  borderRadius: "[8px]",
  fontWeight: "regular",
  color: "text.muted",
  background: "transparent",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "transparent",
});

const itemOn = css({
  fontWeight: "semibold",
  color: "accent.text",
  background: "accent.soft",
  borderColor: "accent.line",
});

const clickHint = css({ fontSize: "[11px]", fontFamily: "mono" });
const rightHint = css({ color: "text.faint" });
const noteClass = css({ padding: "[0 12px 11px]", fontSize: "[11.5px]", color: "text.faint" });

export interface MenuMockProps {
  app?: string;
  crumb?: string;
  items?: MenuItem[];
  note?: ReactNode;
}

/** The settings-menu resemblance for a step's visual. */
export function MenuMock({
  app = "Settings",
  crumb = "Settings",
  items = [],
  note,
}: MenuMockProps) {
  return (
    <div className={root}>
      <div className={head}>
        <span className={headDot} />
        {app}
        <span className={crumbSep}>›</span>
        <span className={crumbCur}>{crumb}</span>
      </div>
      <div className={body}>
        {items.map((it) => (
          <div key={it.label} className={cx(itemBase, it.on && itemOn)}>
            <span>{it.label}</span>
            {it.on && <span className={clickHint}>click →</span>}
            {it.right && !it.on && <span className={rightHint}>{it.right}</span>}
          </div>
        ))}
      </div>
      {note && <div className={noteClass}>{note}</div>}
    </div>
  );
}
