import { useNavigate } from "react-router-dom";
import { css } from "../../../styled-system/css";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { Footer } from "../../components/footer/footer";
import { Icon } from "../../components/icon/icon";
import { Logo } from "../../components/logo/logo";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle";

// The graceful state for an unknown or removed slug — the edge serves it for a miss, and the SPA renders it
// when a slug resolves to nothing. Never a dead end: it names the slug that didn't resolve, says plainly
// there's nothing to recover, and points straight at creating the next one.

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

const mainClass = css({
  flex: "[1]",
  width: "[100%]",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  px: "[26px]",
  py: "[56px]",
});

const colClass = css({ width: "[100%]", maxWidth: "prose", marginInline: "auto" });

const notFoundClass = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "[30px 0]",
});

const glyphClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "[56px]",
  height: "[56px]",
  marginBottom: "[18px]",
  borderRadius: "round",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  background: "bg.surface",
  color: "text.muted",
});

const h1Class = css({
  margin: "[14px 0 0]",
  fontSize: "[clamp(26px, 4vw, 34px)]",
  fontWeight: "semibold",
  letterSpacing: "[-0.02em]",
  lineHeight: "[1.1]",
  color: "text.primary",
});

const subClass = css({
  margin: "[8px auto 0]",
  maxWidth: "[42ch]",
  fontSize: "[16px]",
  lineHeight: "[1.5]",
  color: "text.muted",
});

const ctaClass = css({ marginTop: "[26px]" });
const footerSlotClass = css({ marginTop: "[40px]" });

export interface NotFoundScreenProps {
  /** The slug that didn't resolve, echoed back so the reader recognizes the link they followed. */
  slug?: string;
}

/** The unknown/removed-slug screen. */
export function NotFoundScreen({ slug }: NotFoundScreenProps) {
  const navigate = useNavigate();
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
          <div className={notFoundClass}>
            <span className={glyphClass}>
              <Icon name="search" size={26} />
            </span>
            <Badge mono variant="neutral">
              mcplease.io/{slug || "this-link"}
            </Badge>
            <h1 className={h1Class}>This link doesn’t resolve.</h1>
            <p className={subClass}>
              It may have been removed, or never existed. There’s nothing to recover — but the next
              one is a paste away.
            </p>
            <div className={ctaClass}>
              <Button
                size="lg"
                iconTrailing="arrow-right"
                onClick={() => {
                  void navigate("/");
                }}
              >
                Create a link
              </Button>
            </div>
          </div>
          <div className={footerSlotClass}>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}
