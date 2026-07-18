import { LegalPage, LegalSection } from "./legal-page";

// The /terms route — the deal for the hosted service, in plain words (the code itself is MIT and needs
// no terms). Short on purpose: every clause here is one a reader might actually need — ownership by
// edit link, the public-page trade, the abuse lines, and the as-is/no-liability pair that keeps a free
// service viable. The page's own edit history on GitHub is the changelog.

const REPO = "https://github.com/daretodave/mcplease";

export function TermsPage() {
  return (
    <LegalPage
      title="Terms"
      updated="July 18, 2026"
      lead={
        <>
          The deal, in plain words. mcplease turns an MCP server into a shareable connect page;
          these terms cover the hosted service at mcplease.io. Using it means you’re okay with
          everything below.
        </>
      }
      shortVersion={[
        <>
          You get a free public page for your server; your secret edit link is the only key to it.
        </>,
        <>Don’t publish anything harmful or unlawful, and don’t pretend to be someone else.</>,
        <>
          It’s free and provided as-is — no warranties, and our liability is as small as the law
          allows.
        </>,
      ]}
    >
      <LegalSection index={1} title="The service">
        <p>
          mcplease does one thing: you paste an MCP server, and we host a public page at{" "}
          <code>mcplease.io/&lt;your-slug&gt;</code> that shows visitors how to connect from their
          own client. There are <strong>no accounts</strong>. Creating a link mints a private edit
          URL — <code>/e/&lt;uuid&gt;</code> — shown to you exactly once.
        </p>
        <p>
          <strong>Holding the edit link is ownership.</strong> Anyone who has it can change or
          delete the page, so treat it like a password. We keep only a hash of it — we can’t look
          yours up, resend it, or prove a page is yours once it’s lost.
        </p>
      </LegalSection>

      <LegalSection index={2} title="Your content">
        <p>
          Everything on a page is what its author typed: a server address or run command, a name, a
          description, a tagline. Your content stays <strong>yours</strong>. Publishing it here
          gives us the non-exclusive permission we need to run the service — to store it, show it at
          your slug, and derive the share card, README badge, and page metadata from it. That
          permission ends when you delete the page.
        </p>
        <p>
          Only publish what you have the right to share, and remember the page is{" "}
          <strong>public</strong>: anyone with the URL can read it, and search engines can index it.
        </p>
      </LegalSection>

      <LegalSection index={3} title="The rules">
        <p>Keep it honest and harmless. Don’t use mcplease to:</p>
        <ul>
          <li>
            point people at a server built to hurt them — malware, credential theft, or anything
            intentionally deceptive;
          </li>
          <li>publish content that’s unlawful or that infringes someone else’s rights;</li>
          <li>
            impersonate a person, project, or company — including claiming a slug just to squat on a
            name that’s clearly someone else’s;
          </li>
          <li>
            attack the service itself — flooding the create endpoint, guessing at edit tokens, or
            working around the bot check.
          </li>
        </ul>
      </LegalSection>

      <LegalSection index={4} title="Our part">
        <p>
          The service is free and run in good faith, with <strong>no promise of uptime</strong> or
          of running forever. We may remove a page that breaks these rules, free a slug that’s
          squatting on someone’s name, and change or wind down the service itself. If mcplease ever
          shut down, nothing would be locked away: the whole thing is{" "}
          <a href={REPO} target="_blank" rel="noreferrer noopener">
            open source
          </a>
          , and anyone can run their own.
        </p>
      </LegalSection>

      <LegalSection index={5} title="Other people’s stuff">
        <p>
          The servers that pages describe belong to their authors. We host connect instructions —{" "}
          <strong>we don’t run, review, or vouch for any server</strong>. Connecting to one is
          between you and whoever operates it.
        </p>
        <p>
          The client names a connect page mentions (Claude, Cursor, VS Code, and the rest) are
          trademarks of their owners. mcplease is{" "}
          <strong>not affiliated with or endorsed by</strong> any of them; they appear only to show
          you where to click.
        </p>
      </LegalSection>

      <LegalSection index={6} title="No warranty, tiny liability">
        <p>
          mcplease is provided <strong>“as is” and “as available”</strong>, free of charge, with no
          warranty of any kind, express or implied — including fitness for a particular purpose. To
          the fullest extent the law allows, we’re not liable for any damages arising from the
          service: a page being unavailable, changed, or removed; a lost edit link; or anything a
          listed server or client does.
        </p>
        <p>
          The code itself is separately yours to use under the{" "}
          <a href={`${REPO}/blob/main/LICENSE`} target="_blank" rel="noreferrer noopener">
            MIT license
          </a>
          , which carries its own (equally blunt) warranty language. These terms govern only the
          hosted service.
        </p>
      </LegalSection>

      <LegalSection index={7} title="Changes & questions">
        <p>
          If these terms change, the new words replace this page — and, like everything here,{" "}
          <a href={`${REPO}/commits/main`} target="_blank" rel="noreferrer noopener">
            the edit is public
          </a>{" "}
          in the repo’s history. Using the service after a change means the current version applies.
        </p>
        <p>
          Questions, problems, takedown requests:{" "}
          <a href={`${REPO}/issues`} target="_blank" rel="noreferrer noopener">
            open an issue
          </a>{" "}
          — it’s the fastest path to a human.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
