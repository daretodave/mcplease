import { track } from "@mcplease/analytics";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { css } from "../../../styled-system/css";
import { Button } from "../../components/button/button";
import { Callout } from "../../components/callout/callout";
import { Footer } from "../../components/footer/footer";
import { Icon } from "../../components/icon/icon";
import { Input } from "../../components/input/input";
import { Logo } from "../../components/logo/logo";
import { SegmentedControl } from "../../components/segmented-control/segmented-control";
import { SlugField } from "../../components/slug-field/slug-field";
import { useSlugAvailability } from "../../components/slug-field/use-slug-availability";
import { ThemeToggle } from "../../components/theme-toggle/theme-toggle";
import { SuccessOverlay } from "./success-overlay";
import { Turnstile } from "./turnstile";
import { CreateLinkError, useCreateLink, type CreateLinkRequest } from "./use-create-link";

// The landing IS the create form: one paste in, one link out. The transport switch reveals exactly the
// fields that transport needs; the slug claim checks itself in realtime (advisory — the database arbitrates
// on submit); Turnstile gates a real create at the edge, where the service-role key lives. On success the
// overlay hands over the share link and the one-time edit link behind the saved-it acknowledgment.

type Kind = "http" | "stdio";

const TAGLINE_MAX = 70;

const TRANSPORTS = [
  { value: "http", label: "Remote URL", icon: "link", note: "default" },
  { value: "stdio", label: "Local server", icon: "terminal" },
] as const;

/** Trim, then collapse an empty field to null so optional values are stored as NULL, never "". */
function blank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

/** The human-facing reason a create failed, mapped from the edge's stable error code. */
function errorMessage(error: CreateLinkError | null): string | null {
  if (!error) return null;
  switch (error.code) {
    case "slug_taken":
      return "That slug was just taken — try another.";
    case "invalid_slug":
      return "That slug isn’t valid — letters, numbers and dashes, 2–40 characters.";
    case "invalid_server_url":
      return "That server URL isn’t valid — it must start with http:// or https://.";
    case "field_too_long":
      return "One of your fields is too long — please shorten it.";
    case "turnstile_failed":
    case "turnstile_missing":
      return "We couldn’t verify you’re human — please try again.";
    case "missing_server_url":
      return "Add your server URL to continue.";
    case "missing_repo_url":
      return "Add your clone URL to continue.";
    default:
      return "Something went wrong creating your link — please try again.";
  }
}

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

const mainClass = css({ flex: "[1]", width: "[100%]", pt: "2", pb: "[56px]" });

const colClass = css({
  width: "[100%]",
  maxWidth: "prose",
  marginInline: "auto",
  px: "[26px]",
  boxSizing: "border-box",
});

const eyebrowClass = css({
  margin: "[18px 0 14px]",
  fontFamily: "mono",
  fontSize: "[12px]",
  letterSpacing: "[0.12em]",
  textTransform: "uppercase",
  color: "accent.text",
});

const h1Class = css({
  margin: "[0 0 8px]",
  fontSize: "[clamp(30px, 4.4vw, 42px)]",
  fontWeight: "semibold",
  letterSpacing: "[-0.025em]",
  lineHeight: "[1.08]",
  color: "text.primary",
});

const subClass = css({
  margin: "[0 0 30px]",
  maxWidth: "[46ch]",
  fontSize: "[16px]",
  lineHeight: "[1.5]",
  color: "text.muted",
});

const stackClass = css({ display: "flex", flexDirection: "column", gap: "4" });
const tightStackClass = css({ display: "flex", flexDirection: "column", gap: "3" });
const revealClass = css({ animation: "reveal 0.22s cubic-bezier(0.16, 1, 0.3, 1)" });

const expanderClass = css({
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "border.subtle",
  borderRadius: "md",
  background: "bg.surface",
  overflow: "hidden",
});

const expanderHeadClass = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  width: "[100%]",
  px: "[14px]",
  py: "3",
  background: "transparent",
  borderWidth: "hairline",
  borderStyle: "solid",
  borderColor: "transparent",
  cursor: "pointer",
  fontFamily: "sans",
  fontSize: "[14px]",
  fontWeight: "medium",
  color: "text.primary",
  textAlign: "left",
  transitionProperty: "[background]",
  transitionDuration: "fast",
  transitionTimingFunction: "out",
  _hover: { background: "bg.raised" },
  _focusVisible: { outline: "none", boxShadow: "ring" },
});

const chevronClass = css({
  color: "text.muted",
  transition: "[transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)]",
});
const expanderOptClass = css({ marginLeft: "auto", fontSize: "xs", color: "text.faint" });
const expanderBodyClass = css({ px: "[14px]", pt: "[4px]", pb: "4" });

const fineClass = css({
  margin: "[18px 0 0]",
  fontSize: "sm",
  textAlign: "center",
  color: "text.faint",
});

const footerSlotClass = css({ marginTop: "[36px]" });

export function CreatePage() {
  const navigate = useNavigate();
  const [kind, setKind] = useState<Kind>("http");
  const [server, setServer] = useState("");
  const [repo, setRepo] = useState("");
  const [build, setBuild] = useState("");
  const [run, setRun] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [slug, setSlug] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const [created, setCreated] = useState<{
    slug: string;
    editUrl: string;
    autoMinted: boolean;
  } | null>(null);

  const slugStatus = useSlugAvailability(slug);
  const mutation = useCreateLink();

  const filled = kind === "http" ? server.trim() !== "" : repo.trim() !== "";
  const slugBlocks =
    slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "checking";
  const canCreate = filled && !slugBlocks && turnstileToken !== null && !mutation.isPending;
  const detailCount = [name, description, tagline].filter((v) => v.trim() !== "").length;
  const submitError = errorMessage(mutation.error);

  // A Turnstile token is single-use. After ANY submit — win or lose — re-mount the widget so a later create
  // (the author reopens the form, or retries after an error) solves fresh instead of replaying a spent token
  // the edge would reject as "couldn't verify you're human".
  function rearmTurnstile() {
    setTurnstileToken(null);
    setTurnstileNonce((n) => n + 1);
  }

  function submit() {
    // `canCreate` already implies a non-null token, so this narrows turnstileToken to string below.
    if (!canCreate) return;
    track.createSubmit({ transport: kind });
    const request: CreateLinkRequest = {
      turnstileToken,
      kind,
      serverUrl: kind === "http" ? blank(server) : null,
      repoUrl: kind === "stdio" ? blank(repo) : null,
      buildCmd: kind === "stdio" ? blank(build) : null,
      runTarget: kind === "stdio" ? blank(run) : null,
      name: blank(name),
      description: blank(description),
      tagline: blank(tagline),
      desiredSlug: blank(slug),
    };
    mutation.mutate(request, {
      onSuccess: (result) => {
        track.createSuccess({ transport: kind });
        setCreated({ ...result, autoMinted: blank(slug) === null });
        rearmTurnstile();
      },
      onError: rearmTurnstile,
    });
  }

  return (
    <div className={appClass}>
      <header className={topbarClass}>
        <Logo size={24} />
        <ThemeToggle />
      </header>

      <main className={mainClass}>
        <div className={colClass}>
          <p className={eyebrowClass}>Share one MCP server as a link</p>
          <h1 className={h1Class}>What’s your MCP server?</h1>
          <p className={subClass}>
            Paste it once — whoever opens your link picks their client and follows pictures. No
            account, ever.
          </p>

          <div className={stackClass}>
            <SegmentedControl
              label="Transport"
              value={kind}
              onChange={(value) => setKind(value as Kind)}
              options={TRANSPORTS.map((t) => ({ ...t }))}
            />

            {kind === "http" ? (
              <Input
                label="Server URL"
                mono
                size="lg"
                placeholder="https://example.com/mcp"
                value={server}
                onChange={(event) => setServer(event.target.value)}
              />
            ) : (
              <div className={`${tightStackClass} ${revealClass}`}>
                <Input
                  label="Clone"
                  hint="A git URL — becomes git clone …"
                  mono
                  placeholder="https://github.com/you/your-mcp"
                  value={repo}
                  onChange={(event) => setRepo(event.target.value)}
                />
                <Input
                  label="Build"
                  optional
                  hint="Runs once after clone"
                  mono
                  placeholder="npm install && npm run build"
                  value={build}
                  onChange={(event) => setBuild(event.target.value)}
                />
                <Input
                  label="Run target"
                  hint="The launch command + args"
                  mono
                  placeholder="node dist/server.js"
                  value={run}
                  onChange={(event) => setRun(event.target.value)}
                />
              </div>
            )}

            <SlugField value={slug} status={slugStatus} onChange={setSlug} />

            <div className={expanderClass}>
              <button
                type="button"
                className={expanderHeadClass}
                aria-expanded={showDetails}
                onClick={() => setShowDetails((v) => !v)}
              >
                <Icon
                  name="chevron-down"
                  size={16}
                  className={chevronClass}
                  style={{ transform: showDetails ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
                Add details
                <span className={expanderOptClass}>
                  optional{detailCount ? ` · ${detailCount} added` : ""}
                </span>
              </button>
              {showDetails ? (
                <div className={`${tightStackClass} ${revealClass} ${expanderBodyClass}`}>
                  <Input
                    label="Name"
                    hint="A friendly title — shown as your page heading"
                    placeholder="Acme MCP"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                  <Input
                    label="Description"
                    hint="One sentence for anyone browsing your link"
                    placeholder="Tickets, deploys and on-call, from your editor."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  <Input
                    label="Tagline"
                    hint={`Shows on the share card — ${TAGLINE_MAX - tagline.length} characters left`}
                    maxLength={TAGLINE_MAX}
                    placeholder="Your repo’s MCP, one paste away."
                    value={tagline}
                    onChange={(event) => setTagline(event.target.value)}
                  />
                </div>
              ) : null}
            </div>

            <Turnstile key={turnstileNonce} onVerify={setTurnstileToken} />

            {submitError ? (
              <Callout variant="bad" title="Couldn’t create your link">
                {submitError}
              </Callout>
            ) : null}

            <Button
              size="lg"
              block
              iconTrailing="arrow-right"
              loading={mutation.isPending}
              disabled={!canCreate}
              onClick={submit}
            >
              Create my link
            </Button>
            <p className={fineClass}>
              No sign-up, no email. Open source, MIT — we store only what the link needs.
            </p>
          </div>

          <div className={footerSlotClass}>
            <Footer />
          </div>
        </div>
      </main>

      {created ? (
        <SuccessOverlay
          slug={created.slug}
          editUrl={created.editUrl}
          autoMinted={created.autoMinted}
          onClose={() => setCreated(null)}
          onView={() => {
            void navigate(`/${created.slug}`);
          }}
        />
      ) : null}
    </div>
  );
}
