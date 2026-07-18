import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { Callout } from "../../components/callout/callout";
import { Footer } from "../../components/footer/footer";
import { Logo } from "../../components/logo/logo";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle";

// The shared frame for the legal pages (/terms, /privacy). Same chrome as every other route — topbar,
// prose column, footer — with a reading rhythm tuned for prose: an eyebrow + updated stamp over the
// title, a "short version" callout that carries the whole page in three lines, then numbered sections
// whose chips echo the share page's step numbers. The pages are plain words by design: what we store,
// what we promise, said the way a human would.

const appClass = css({
  minHeight: "[100dvh]",
  display: "flex",
  flexDirection: "column",
  background: "bg.canvas",
});

const topbarClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4",
  px: "[26px]",
  py: "[18px]",
});

const homeClass = css({ display: "inline-flex" });

const mainClass = css({ flex: "[1]", width: "[100%]", pt: "2", pb: "[56px]" });

const colClass = css({
  width: "[100%]",
  maxWidth: "prose",
  marginInline: "auto",
  px: "[26px]",
  boxSizing: "border-box",
});

// The eyebrow names the genre; the stamp opposite it says when the words last changed.
const eyebrowRowClass = css({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "3",
  margin: "[18px 0 14px]",
});

const eyebrowClass = css({
  fontFamily: "mono",
  fontSize: "[12px]",
  letterSpacing: "[0.12em]",
  textTransform: "uppercase",
  color: "accent.text",
});

const updatedClass = css({
  fontFamily: "mono",
  fontSize: "[12px]",
  color: "text.faint",
});

const h1Class = css({
  margin: "[0 0 8px]",
  fontSize: "[clamp(30px, 4.4vw, 42px)]",
  fontWeight: "semibold",
  letterSpacing: "[-0.025em]",
  lineHeight: "[1.08]",
  color: "text.primary",
});

const leadClass = css({
  margin: "[0 0 22px]",
  maxWidth: "[58ch]",
  fontSize: "[16px]",
  lineHeight: "[1.55]",
  color: "text.muted",
});

const shortListClass = css({
  margin: "[2px 0 0]",
  padding: "[0 0 0 18px]",
  display: "flex",
  flexDirection: "column",
  gap: "[5px]",
  "& li::marker": { color: "accent.base" },
});

const sectionClass = css({ marginTop: "[36px]" });

const h2Class = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  margin: "[0 0 12px]",
  fontSize: "[19px]",
  fontWeight: "semibold",
  letterSpacing: "[-0.01em]",
  lineHeight: "snug",
  color: "text.primary",
});

// The section number, drawn like a share-page step chip — the legal pages read as steps too.
const numClass = css({
  flexShrink: "0",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[26px]",
  height: "[26px]",
  borderRadius: "round",
  background: "accent.soft",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "accent.line",
  color: "accent.text",
  fontFamily: "mono",
  fontSize: "[12px]",
  fontWeight: "semibold",
});

// One nested style block gives the section prose its whole voice: quiet paragraphs, accent markers,
// chip-styled inline code, and underlined links (color alone can't carry a link inside muted prose).
const bodyClass = css({
  "& p": { margin: "[0 0 12px]", fontSize: "[15.5px]", lineHeight: "[1.65]", color: "text.muted" },
  "& p:last-child": { marginBottom: "[0]" },
  "& ul": {
    margin: "[0 0 12px]",
    padding: "[0 0 0 20px]",
    display: "flex",
    flexDirection: "column",
    gap: "[7px]",
  },
  "& ul:last-child": { marginBottom: "[0]" },
  "& li": { fontSize: "[15.5px]", lineHeight: "[1.6]", color: "text.muted", paddingLeft: "[2px]" },
  "& li::marker": { color: "accent.base" },
  "& strong": { color: "text.primary", fontWeight: "semibold" },
  "& code": {
    fontFamily: "mono",
    fontSize: "[0.9em]",
    color: "text.primary",
    background: "bg.inset",
    padding: "[1px 5px]",
    borderRadius: "[4px]",
    whiteSpace: "nowrap",
  },
  "& a": {
    color: "accent.text",
    textDecorationLine: "underline",
    textDecorationColor: "accent.line",
    textUnderlineOffset: "[3px]",
    transitionProperty: "[color, text-decoration-color]",
    transitionDuration: "fast",
    transitionTimingFunction: "out",
  },
  "& a:hover": { textDecorationColor: "accent.base" },
});

const footerSlotClass = css({ marginTop: "[40px]" });

export interface LegalSectionProps {
  /** The section's position, rendered as a two-digit chip (decorative — the heading name stays clean). */
  index: number;
  title: string;
  children: ReactNode;
}

/** One numbered section of legal prose. Children are plain `<p>`/`<ul>` — the frame styles them. */
export function LegalSection({ index, title, children }: LegalSectionProps) {
  return (
    <section className={sectionClass}>
      <h2 className={h2Class}>
        <span className={numClass} aria-hidden="true">
          {String(index).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}

export interface LegalPageProps {
  /** The page's h1 — "Terms" / "Privacy". */
  title: string;
  /** When the words last materially changed, already formatted for reading ("July 18, 2026"). */
  updated: string;
  /** The one-paragraph framing under the title. */
  lead: ReactNode;
  /** The whole page in a few honest lines, rendered as "The short version" before the sections. */
  shortVersion: ReadonlyArray<ReactNode>;
  children: ReactNode;
}

/**
 * The legal page frame. Both pages wear it so Terms and Privacy read as one set: same chrome, same
 * rhythm, same short-version-first honesty. The long words below never contradict the three lines up top.
 */
export function LegalPage({ title, updated, lead, shortVersion, children }: LegalPageProps) {
  return (
    <div className={appClass}>
      <header className={topbarClass}>
        <a href="/" className={homeClass} aria-label="mcplease home">
          <Logo size={24} />
        </a>
        <ThemeToggle />
      </header>
      <main className={mainClass}>
        <div className={colClass}>
          <div className={eyebrowRowClass}>
            <span className={eyebrowClass}>The fine print</span>
            <span className={updatedClass}>Updated {updated}</span>
          </div>
          <h1 className={h1Class}>{title}</h1>
          <p className={leadClass}>{lead}</p>
          <Callout variant="accent" title="The short version">
            <ul className={shortListClass}>
              {shortVersion.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </Callout>
          {children}
          <div className={footerSlotClass}>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
