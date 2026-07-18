import type { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { LegalPage, LegalSection } from "./legal-page";

// The /privacy route — the complete inventory of what mcplease stores, in words a human reads. The
// centerpiece is the field table: the links table IS the whole database, so the page can honestly
// render the entire schema and be done. Everything else is where the plumbing lives (Cloudflare,
// Supabase, Google) and how deletion works. No accounts means most privacy policies' hard parts
// simply don't exist here — the page says so instead of padding itself.

const REPO = "https://github.com/daretodave/mcplease";

// The schema, rendered as a card: a caption bar over mono field names beside their plain meaning.
const tableClass = css({
  margin: "[2px 0 14px]",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "lg",
  background: "bg.surface",
  overflow: "hidden",
});

const captionClass = css({
  px: "4",
  py: "[9px]",
  borderBottomWidth: "hairline",
  borderBottomStyle: "solid",
  borderBottomColor: "border.subtle",
  background: "bg.inset",
  fontFamily: "mono",
  fontSize: "[11px]",
  letterSpacing: "[0.08em]",
  textTransform: "uppercase",
  color: "text.faint",
});

const dlClass = css({
  margin: "[0]",
  "& > div + div": {
    borderTopWidth: "hairline",
    borderTopStyle: "solid",
    borderTopColor: "border.subtle",
  },
});

const rowClass = css({
  display: "grid",
  gridTemplateColumns: "[1fr]",
  rowGap: "[2px]",
  columnGap: "4",
  px: "4",
  py: "[10px]",
  md: { gridTemplateColumns: "[190px minmax(0, 1fr)]" },
});

const dtClass = css({ fontFamily: "mono", fontSize: "[13px]", color: "text.primary" });

const ddClass = css({ margin: "[0]", fontSize: "sm", lineHeight: "[1.5]", color: "text.muted" });

interface FieldRow {
  field: string;
  note: ReactNode;
}

function FieldTable({ caption, rows }: { caption: string; rows: ReadonlyArray<FieldRow> }) {
  return (
    <div className={tableClass}>
      <div className={captionClass}>{caption}</div>
      <dl className={dlClass}>
        {rows.map((row) => (
          <div key={row.field} className={rowClass}>
            <dt className={dtClass}>{row.field}</dt>
            <dd className={ddClass}>{row.note}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const LINK_FIELDS: ReadonlyArray<FieldRow> = [
  { field: "slug", note: "the public address you claimed (or the random one we minted)" },
  { field: "kind", note: "the transport — http or stdio" },
  {
    field: "server details",
    note: "the server address, or the repo / build / run trio for local servers",
  },
  {
    field: "name · description · tagline",
    note: "the words on the page and its share card, exactly as typed",
  },
  {
    field: "edit-token hash",
    note: "a SHA-256 fingerprint of your edit link’s token — the token itself is never stored",
  },
  { field: "timestamps", note: "created, updated, and — if you delete — deleted" },
];

export function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      updated="July 18, 2026"
      lead={
        <>
          No accounts, no profiles, no ad pixels. This page is the complete inventory of what
          mcplease stores and why — short, because there isn’t much.
        </>
      }
      shortVersion={[
        <>We store exactly what you type when you create a link — nothing about who you are.</>,
        <>Usage is counted anonymously and cookieless; just visiting a page stores nothing.</>,
        <>Your edit link deletes your page whenever you like.</>,
      ]}
    >
      <LegalSection index={1} title="What we store">
        <p>Creating a link writes one row to one table — and this is the entire database:</p>
        <FieldTable caption="the links table · the whole database" rows={LINK_FIELDS} />
        <p>If you never create a link, nothing about you is stored at all.</p>
      </LegalSection>

      <LegalSection index={2} title="What we never have">
        <p>
          There are no accounts, so there’s nothing to attach a person to — no names, emails, or
          passwords. Reading a page writes <strong>nothing</strong>: no view counts, no visitor
          logs, no per-link stats. Our database holds pages, not people.
        </p>
      </LegalSection>

      <LegalSection index={3} title="On your device">
        <p>
          Two small preferences live in your browser’s localStorage and never leave it:{" "}
          <code>mcplease-appearance</code> (your theme choice) and <code>mcplease-last-client</code>{" "}
          (the client you last picked, so the next connect page opens on it). We set{" "}
          <strong>no cookies</strong> of our own.
        </p>
      </LegalSection>

      <LegalSection index={4} title="Anonymous analytics">
        <p>
          We count usage with Google Analytics 4 in its strictest shape: every consent signal is{" "}
          <strong>wired to “denied”</strong>, so it runs cookieless and keeps no identifier for you,
          and IP addresses are anonymized.
        </p>
        <p>
          Events are a short, fixed list of product actions — “copied a command”, “picked a client”,
          “toggled the theme” — carrying coarse labels only. <strong>Never</strong> a server URL, a
          slug, or anything that could identify you or your server.
        </p>
      </LegalSection>

      <LegalSection index={5} title="Who runs the plumbing">
        <p>
          mcplease runs on three providers. Each sees what it needs to do its job — which, as with
          every website, includes the IP address your browser sends with each request. None of that
          lands in our database.
        </p>
        <ul>
          <li>
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noreferrer noopener"
            >
              Cloudflare
            </a>{" "}
            serves the site and runs the bot check (Turnstile) on the create form — it weighs
            technical browser signals to tell humans from scripts; we only receive the verdict.
          </li>
          <li>
            <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer noopener">
              Supabase
            </a>{" "}
            hosts the Postgres database holding the table above.
          </li>
          <li>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
              Google
            </a>{" "}
            receives the anonymous analytics events.
          </li>
        </ul>
      </LegalSection>

      <LegalSection index={6} title="Deleting your page">
        <p>
          Open your edit link (<code>/e/&lt;uuid&gt;</code>) and press <strong>Delete</strong>. The
          page, its badge, and its share card stop resolving immediately, and the slug is freed for
          anyone to claim. The row itself is kept — marked deleted and excluded from every read — so
          mistakes and abuse stay traceable. Want it wiped from the database entirely?{" "}
          <a href={`${REPO}/issues`} target="_blank" rel="noreferrer noopener">
            Open an issue
          </a>{" "}
          and we’ll hard-delete it.
        </p>
        <p>
          Lost the edit link? Nothing ties a page to a person — that’s the design — so we can’t
          verify a page is yours and hand back control. But if a page publishes something about you
          that shouldn’t be public, open an issue and we’ll treat it as the takedown it is.
        </p>
      </LegalSection>

      <LegalSection index={7} title="Changes & questions">
        <p>
          If our practices change, this page changes first — and{" "}
          <a href={`${REPO}/commits/main`} target="_blank" rel="noreferrer noopener">
            the edit is public
          </a>{" "}
          in the repo’s history: a privacy policy you can diff. Questions:{" "}
          <a href={`${REPO}/issues`} target="_blank" rel="noreferrer noopener">
            open an issue
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
