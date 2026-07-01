import type { UpdateLinkInput } from "@mcplease/data";
import { track } from "@mcplease/analytics";
import type { PublicLink } from "@mcplease/model";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { data } from "../../lib/data";
import { NotFoundScreen } from "../share/not-found";
import { useDeleteLink, useUpdateLink } from "./use-edit-link";

// The /e/<uuid> owner surface. Possession of the unguessable UUID edit link is the whole authorization —
// no account, no session (spec §4.4, §8). It loads the link behind the token, lets the owner change the
// slug live (the UUID is the stable token; the slug is just a mutable column, so a slug change never breaks
// the edit link), and soft-deletes behind a two-step confirm. The transport is fixed once minted, so its
// segmented control is read-only here — it shows the kind, it doesn't change it.

const TAGLINE_MAX = 70;

const TRANSPORTS = [
  { value: "http", label: "Remote URL", icon: "link" },
  { value: "stdio", label: "Local server", icon: "terminal" },
] as const;

const SAVED_MS = 1600;

/** Trim, then collapse an empty field to null so optional values persist as NULL, never "". */
function blank(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
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

const topbarRightClass = css({ display: "flex", alignItems: "center", gap: "2" });
const homeClass = css({ display: "inline-flex" });

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

const dangerZoneClass = css({ marginTop: "[34px]" });

const dangerRowClass = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "3",
  pt: "[22px]",
  borderTopWidth: "hairline",
  borderTopStyle: "solid",
  borderTopColor: "border.subtle",
});

const dangerTextClass = css({ display: "flex", flexDirection: "column", gap: "[2px]" });
const dangerTitleClass = css({ fontSize: "[14px]", fontWeight: "semibold", color: "text.primary" });
const dangerBodyClass = css({ fontSize: "sm", color: "text.muted" });

const footerSlotClass = css({ marginTop: "[36px]" });

// The green "Saved" fill + the red delete affordance read from the theme's state ramp. Button seals its own
// className, so these one-shot state colors ride the `style` escape hatch as the materialized token vars.
const savedFill = { background: "var(--colors-state-ok)" } as const;
const badTint = { color: "var(--colors-state-bad)" } as const;

// Loading / error use the same topbar chrome as the resolved page so a slow load or a dead token never
// flashes a bare screen — just the topbar over a centered status.
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

/** The editable form for a loaded link. Local field state seeds from the link; the slug checks itself live
 *  (unchanged reads idle — it's already yours), and saving persists through the token-authorized RPC. */
function EditForm({ link, editToken }: { link: PublicLink; editToken: string }) {
  const navigate = useNavigate();

  // The persisted slug — the baseline the live check measures against, re-based after each successful save
  // so the just-saved slug reads idle rather than "available".
  const [savedSlug, setSavedSlug] = useState(link.slug);
  const [slug, setSlug] = useState(link.slug);
  const [server, setServer] = useState(link.serverUrl ?? "");
  const [repo, setRepo] = useState(link.repoUrl ?? "");
  const [build, setBuild] = useState(link.buildCmd ?? "");
  const [run, setRun] = useState(link.runTarget ?? "");
  const [name, setName] = useState(link.name ?? "");
  const [tagline, setTagline] = useState(link.tagline ?? "");
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);

  const slugStatus = useSlugAvailability(slug, savedSlug);
  const update = useUpdateLink();
  const remove = useDeleteLink();

  // The green "Saved" acknowledgment flashes for a beat, then the button returns to "Save changes".
  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), SAVED_MS);
    return () => clearTimeout(id);
  }, [saved]);

  const isHttp = link.kind === "http";
  const filled = isHttp ? server.trim() !== "" : repo.trim() !== "";
  const slugBlocks =
    slugStatus === "taken" || slugStatus === "invalid" || slugStatus === "checking";
  const canSave = filled && !slugBlocks && !update.isPending;

  function saveChanges() {
    if (!canSave) return;
    // Fields not exposed on the edit surface (the other transport's inputs, the description) are preserved
    // as-is — an edit never nulls what it doesn't show.
    const fields: UpdateLinkInput = {
      slug: slug.trim().toLowerCase(),
      serverUrl: isHttp ? blank(server) : link.serverUrl,
      repoUrl: isHttp ? link.repoUrl : blank(repo),
      buildCmd: isHttp ? link.buildCmd : blank(build),
      runTarget: isHttp ? link.runTarget : blank(run),
      name: blank(name),
      description: link.description,
      tagline: blank(tagline),
    };
    update.mutate(
      { editToken, fields },
      {
        onSuccess: (updated) => {
          if (!updated) return;
          track.editSave({ transport: link.kind });
          setSavedSlug(updated.slug);
          setSlug(updated.slug);
          setSaved(true);
        },
      },
    );
  }

  function confirmDelete() {
    remove.mutate(editToken, {
      onSuccess: () => {
        track.editDelete({});
        // The row is soft-deleted, so every read now misses — routing to the (now-dead) slug resolves to
        // the same not-found screen the edge serves. Replace, so Back doesn't return to a stale editor.
        void navigate(`/${link.slug}`, { replace: true });
      },
    });
  }

  return (
    <div className={appClass}>
      <header className={topbarClass}>
        <a href="/" className={homeClass} aria-label="mcplease home">
          <Logo size={24} />
        </a>
        <div className={topbarRightClass}>
          <Button
            variant="ghost"
            size="sm"
            iconTrailing="arrow-right"
            onClick={() => {
              void navigate(`/${link.slug}`);
            }}
          >
            Back to page
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className={mainClass}>
        <div className={colClass}>
          <p className={eyebrowClass}>Editing mcplease.io/{savedSlug}</p>
          <h1 className={h1Class}>Edit your link</h1>
          <p className={subClass}>
            No account — possession of this edit link is the whole authorization.
          </p>

          <div className={stackClass}>
            <SlugField
              label="Slug"
              hint="Change it freely — your edit link never breaks."
              value={slug}
              status={slugStatus}
              onChange={setSlug}
            />

            <SegmentedControl
              label="Transport"
              value={link.kind}
              // Read-only: the transport is fixed once the link is minted. Both options are disabled, so the
              // control shows the kind without offering to change it.
              options={TRANSPORTS.map((t) => ({ ...t, disabled: true }))}
            />

            {isHttp ? (
              <Input
                label="Server URL"
                mono
                value={server}
                onChange={(event) => setServer(event.target.value)}
              />
            ) : (
              <div className={`${tightStackClass} ${revealClass}`}>
                <Input
                  label="Clone"
                  hint="A git URL — becomes git clone …"
                  mono
                  value={repo}
                  onChange={(event) => setRepo(event.target.value)}
                />
                <Input
                  label="Build"
                  optional
                  hint="Runs once after clone"
                  mono
                  value={build}
                  onChange={(event) => setBuild(event.target.value)}
                />
                <Input
                  label="Run target"
                  hint="The launch command + args"
                  mono
                  value={run}
                  onChange={(event) => setRun(event.target.value)}
                />
              </div>
            )}

            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} />
            <Input
              label="Tagline"
              maxLength={TAGLINE_MAX}
              hint={`${TAGLINE_MAX - tagline.length} characters left`}
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
            />

            {update.isError ? (
              <Callout variant="bad" title="Couldn’t save your changes">
                Something went wrong saving — please try again.
              </Callout>
            ) : null}

            <div>
              <Button
                icon={saved ? "check" : undefined}
                style={saved ? savedFill : undefined}
                loading={update.isPending}
                disabled={!canSave}
                onClick={saveChanges}
              >
                {saved ? "Saved" : "Save changes"}
              </Button>
            </div>
          </div>

          <div className={dangerZoneClass}>
            {!confirming ? (
              <div className={dangerRowClass}>
                <div className={dangerTextClass}>
                  <span className={dangerTitleClass}>Delete this link</span>
                  <span className={dangerBodyClass}>
                    It stops resolving right away. This can’t be undone.
                  </span>
                </div>
                <Button
                  variant="secondary"
                  icon="trash"
                  style={badTint}
                  onClick={() => setConfirming(true)}
                >
                  Delete
                </Button>
              </div>
            ) : (
              <Callout
                variant="bad"
                title="Delete this link?"
                action={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirming(false)}
                      disabled={remove.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      style={badTint}
                      loading={remove.isPending}
                      onClick={confirmDelete}
                    >
                      Yes, delete
                    </Button>
                  </>
                }
              >
                <code>mcplease.io/{link.slug}</code> will stop working immediately.
              </Callout>
            )}
          </div>

          <div className={footerSlotClass}>
            <Footer />
          </div>
        </div>
      </main>
    </div>
  );
}

/** The /e/:uuid route: load the link behind the token, then render the editor, a dead-token not-found, or a
 *  transient loading/error status. A missing or expired token resolves to null → the not-found screen. */
export function EditPage() {
  const { uuid } = useParams();
  const query = useQuery({
    queryKey: ["edit-link", uuid],
    queryFn: () => data.links.getForEdit(uuid as string),
    enabled: Boolean(uuid),
  });

  if (!uuid) return <NotFoundScreen />;
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
  if (!query.data) return <NotFoundScreen />;
  return <EditForm link={query.data} editToken={uuid} />;
}
