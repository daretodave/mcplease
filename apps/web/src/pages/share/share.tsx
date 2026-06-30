import { track } from "@mcplease/analytics";
import { clientsForTransport, type ClientId } from "@mcplease/client-matrix";
import type { LinkKind, PublicLink } from "@mcplease/model";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { css } from "../../../styled-system/css";
import { Badge } from "../../components/badge/badge";
import { Button } from "../../components/button/button";
import { ClientPicker } from "../../components/client-picker/client-picker";
import { Footer } from "../../components/footer/footer";
import { Icon } from "../../components/icon/icon";
import { Logo } from "../../components/logo/logo";
import { StepCard } from "../../components/step-card/step-card";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle";
import { data } from "../../lib/data";
import { BadgePanel } from "./badge-panel";
import { buildSteps } from "./build-steps";
import { CONNECT_LABEL, LAST_CLIENT_KEY } from "./clients";
import { NotFoundScreen } from "./not-found";
import { OneClickBanner } from "./one-click-banner";
import { oneClickHref, oneClickMode } from "./one-click";

// The /<slug> connect page. It resolves the public link, then turns it into the visitor's own setup: pick a
// client, see steps drawn to resemble THAT client's surface, with a one-click Add above the manual fallback.
// The transport is fixed by the link; the picker only offers clients that speak it. A miss renders the
// not-found screen (the same one the edge serves). Edits live behind the secret UUID link, so there's no
// edit affordance here — this page is for whoever the link was shared with.

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
  maxWidth: "share",
  marginInline: "auto",
  px: "[26px]",
  boxSizing: "border-box",
});

const headClass = css({ padding: "[14px 0 22px]" });

const titleClass = css({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "3",
  margin: "[0 0 6px]",
  fontSize: "[clamp(26px, 3.6vw, 34px)]",
  fontWeight: "semibold",
  letterSpacing: "[-0.02em]",
  lineHeight: "[1.15]",
  color: "text.primary",
});

const tagClass = css({
  margin: "[0]",
  fontSize: "[17px]",
  lineHeight: "[1.5]",
  color: "text.muted",
});

const sectionLabel = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "[26px 0 12px]",
  fontFamily: "mono",
  fontSize: "[11px]",
  letterSpacing: "[0.08em]",
  textTransform: "uppercase",
  color: "text.faint",
});

const stepCountClass = css({ textTransform: "none", letterSpacing: "[0]" });

const fallbackLabel = css({ margin: "[-2px 0 10px]", fontSize: "[12px]", color: "text.faint" });

const stepsClass = css({ display: "flex", flexDirection: "column", gap: "4" });

const footerSlotClass = css({ marginTop: "[40px]" });

// Loading / error use the same chrome as the resolved page so a miss or a slow fetch never flashes a bare
// screen — just the topbar over a centered status.
const centerMainClass = css({
  flex: "[1]",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "4",
  px: "[26px]",
  py: "[56px]",
  textAlign: "center",
});

const spinnerClass = css({ color: "text.faint", animation: "spin 0.7s linear infinite" });
const statusTextClass = css({ margin: "[0]", fontSize: "[15px]", color: "text.muted" });

function Chrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={appClass}>
      <header className={topbarClass}>
        <a href="/" className={homeClass} aria-label="mcplease home">
          <Logo size={24} />
        </a>
        <ThemeToggle />
      </header>
      <main className={centerMainClass}>{children}</main>
    </div>
  );
}

/** Read the last-picked client, clamped to one this link's transport actually offers (a stored http-only
 *  client is dropped for a stdio link), falling back to the first available — Claude Code, which speaks both. */
function initialClient(kind: LinkKind): ClientId {
  const allowed = clientsForTransport(kind);
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LAST_CLIENT_KEY);
  } catch {
    /* private mode / storage off — fall through to the default */
  }
  if (stored && allowed.some((c) => c.id === stored)) return stored as ClientId;
  return allowed[0]?.id ?? "claude-code";
}

/** The resolved page — the link exists, so build the visitor's setup around their chosen client. */
function Resolved({ link }: { link: PublicLink }) {
  const [client, setClient] = useState<ClientId>(() => initialClient(link.kind));
  const steps = buildSteps(client, link);
  const mode = oneClickMode(client, link.kind);
  const href = mode ? oneClickHref(client, link) : null;
  const label = CONNECT_LABEL[client];

  function pick(next: ClientId) {
    setClient(next);
    try {
      localStorage.setItem(LAST_CLIENT_KEY, next);
    } catch {
      /* persistence is a nicety, not a requirement */
    }
    track.selectClient({ client: next, transport: link.kind });
  }

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
          <div className={headClass}>
            <h1 className={titleClass}>
              {link.name || link.slug}
              <Badge mono variant={link.kind === "http" ? "accent" : "neutral"}>
                {link.kind}
              </Badge>
            </h1>
            {link.tagline ? <p className={tagClass}>{link.tagline}</p> : null}
          </div>

          <h2 className={sectionLabel}>Pick your client</h2>
          <ClientPicker value={client} onChange={pick} transport={link.kind} />

          <h2 className={sectionLabel}>
            <span>Connect with {label}</span>
            <span className={stepCountClass}>
              {steps.length} step{steps.length > 1 ? "s" : ""}
            </span>
          </h2>

          {mode ? (
            <>
              <OneClickBanner
                client={client}
                href={href}
                onAdd={() => track.oneClick({ client, transport: link.kind })}
              />
              <div className={fallbackLabel}>
                {mode === "partial" ? "Or finish it by hand" : "Or set it up by hand"}
              </div>
            </>
          ) : null}

          <div className={stepsClass}>
            {steps.map((step, i) => (
              <StepCard
                key={`${client}-${i}`}
                index={i + 1}
                title={step.title}
                description={step.description}
                visual={step.visual}
                command={step.command}
                prompt={step.prompt}
                block={step.block}
                onCopied={() => track.copyCommand({ client, transport: link.kind })}
              />
            ))}
          </div>

          <h2 className={sectionLabel}>Add a badge to your README</h2>
          <BadgePanel link={link} onCopyBadge={() => track.copyBadge({ variant: "connect" })} />

          <div className={footerSlotClass}>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

/** The /<slug> route: resolve the public link, then render the connect page, the not-found screen, or a
 *  transient loading/error status. */
export function SharePage() {
  const { slug } = useParams();
  const query = useQuery({
    queryKey: ["link", slug],
    queryFn: () => data.links.getPublic(slug as string),
    enabled: Boolean(slug),
  });

  if (!slug) return <NotFoundScreen />;
  if (query.isLoading) {
    return (
      <Chrome>
        {/* role=status so a screen reader announces the load, and the resolved/error transition off it. */}
        <div role="status">
          <Icon name="loader" size={28} className={spinnerClass} title="Loading" />
        </div>
      </Chrome>
    );
  }
  if (query.isError) {
    return (
      <Chrome>
        {/* role=alert so the failure is announced when it replaces the spinner. */}
        <p className={statusTextClass} role="alert">
          We couldn’t load this link just now.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            void query.refetch();
          }}
        >
          Try again
        </Button>
      </Chrome>
    );
  }
  if (!query.data) return <NotFoundScreen slug={slug} />;
  return <Resolved link={query.data} />;
}
