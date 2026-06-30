-- The links table + the RPCs that are the entire data surface.
--
-- mcplease has no accounts. The browser holds only the anon key and calls these SECURITY DEFINER
-- functions directly; possession of the UUID edit token — re-hashed and verified inside the RPC — is the
-- sole authorization on the edit/delete path. `create_link` is the one exception: it runs only from the
-- service-role create endpoint at the edge (Turnstile-gated), never the browser, so only `service_role`
-- may execute it.
--
-- The table itself is reachable ONLY through these functions: RLS is on with no policies, which denies
-- all direct anon/authenticated access, while the SECURITY DEFINER functions (owned by the migration
-- role) bypass it. Every function pins `search_path = ''` and fully-qualifies its objects, so a definer
-- function can't be hijacked by a caller's search_path.

create table public.links (
  id            uuid primary key default gen_random_uuid(),
  -- the friendly URL key; mutable, always stored lowercase, unique among live rows
  slug          text not null,
  -- the transport: a remote 'http' server or a local 'stdio' one
  kind          text not null check (kind in ('http', 'stdio')),
  -- http transport
  server_url    text,
  -- stdio transport — clone / build (Markdown source) / run
  repo_url      text,
  build_cmd     text,
  run_target    text,
  -- author-facing copy
  name          text,
  description   text,
  tagline       text check (tagline is null or char_length(tagline) <= 70),
  -- SHA-256 hex of the raw UUID edit token; the raw token is returned once at create and never stored
  edit_token_hash text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- soft-delete: a non-null timestamp hides the row from every read and frees its slug
  deleted_at    timestamptz
);

-- The slug is unique among LIVE rows only — a soft-deleted link frees its slug for reuse. This partial
-- unique index is the race-proof arbiter that the realtime availability check only approximates.
create unique index links_live_slug_key on public.links (slug) where deleted_at is null;

-- Edit/delete hash the incoming token then probe live rows by that hash.
create index links_edit_token_hash_idx on public.links (edit_token_hash) where deleted_at is null;

alter table public.links enable row level security;

-- ── helpers (private; the definer RPCs call them as owner) ──────────────────────────────────────────

-- The stored hash of an edit token: lowercase hex SHA-256 of its canonical UUID text.
create function public._edit_token_hash(token uuid)
returns text language sql immutable set search_path = '' as $$
  select encode(pg_catalog.sha256(pg_catalog.convert_to(token::text, 'utf8')), 'hex')
$$;

-- A slug is valid iff: 2–40 chars; lowercase alphanumerics in single-dash-separated segments (which
-- forbids leading/trailing and doubled dashes and any other character); and not a reserved name. This
-- mirrors the pure slug rules the client enforces, so a slug accepted here and there always agree.
create function public._slug_valid(slug text)
returns boolean language sql immutable set search_path = '' as $$
  select slug is not null
     and pg_catalog.char_length(slug) between 2 and 40
     and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     and slug <> all (array[
       'e', 'og', 'api', 'badge', 'terms', 'privacy', 'assets',
       'admin', 'new', 'create', 'edit', 'about', 'help', 'mcplease',
       'favicon', 'robots', 'sitemap'
     ])
$$;

-- Mint a friendly random slug (adjective-noun-NN), retrying past the rare collision and falling back to
-- a short hash-suffixed token if the friendly space is exhausted.
create function public._mint_slug()
returns text language plpgsql set search_path = '' as $$
declare
  adjectives text[] := array[
    'sunny','calm','brave','swift','clever','gentle','lucky','merry',
    'nimble','quiet','snug','witty','breezy','cosy','jolly','plucky'];
  nouns text[] := array[
    'otter','maple','river','pixel','comet','pebble','sparrow','willow',
    'lantern','harbor','meadow','cedar','finch','cove','beacon','thicket'];
  candidate text;
  tries int := 0;
begin
  loop
    candidate :=
      adjectives[1 + floor(random() * array_length(adjectives, 1))::int] || '-' ||
      nouns[1 + floor(random() * array_length(nouns, 1))::int] || '-' ||
      (10 + floor(random() * 90))::int::text;
    exit when not exists (
      select 1 from public.links where slug = candidate and deleted_at is null
    );
    tries := tries + 1;
    if tries > 25 then
      candidate := 'mcp-' || substr(
        encode(pg_catalog.sha256(pg_catalog.convert_to(gen_random_uuid()::text, 'utf8')), 'hex'), 1, 10);
      exit;
    end if;
  end loop;
  return candidate;
end;
$$;

-- ── RPCs ─────────────────────────────────────────────────────────────────────────────────────────────

-- Realtime check: is this slug both well-formed and free? Advisory — the unique index is the arbiter.
create function public.slug_available(candidate text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public._slug_valid(lower(btrim(candidate)))
     and not exists (
       select 1 from public.links
       where slug = lower(btrim(candidate)) and deleted_at is null
     )
$$;

-- The public projection for a live slug, or no row for an unknown/deleted one. Never edit_token_hash.
create function public.get_public_link(want_slug text)
returns table (
  slug text, kind text, server_url text, repo_url text, build_cmd text,
  run_target text, name text, description text, tagline text
) language sql stable security definer set search_path = '' as $$
  select l.slug, l.kind, l.server_url, l.repo_url, l.build_cmd,
         l.run_target, l.name, l.description, l.tagline
  from public.links l
  where l.slug = lower(btrim(want_slug)) and l.deleted_at is null
$$;

-- The editable projection IFF the token hash matches a live row; otherwise no row (possession is auth).
create function public.get_link_for_edit(token uuid)
returns table (
  slug text, kind text, server_url text, repo_url text, build_cmd text,
  run_target text, name text, description text, tagline text
) language sql stable security definer set search_path = '' as $$
  select l.slug, l.kind, l.server_url, l.repo_url, l.build_cmd,
         l.run_target, l.name, l.description, l.tagline
  from public.links l
  where l.edit_token_hash = public._edit_token_hash(token) and l.deleted_at is null
$$;

-- Create a link. Mints a slug when none is desired; validates and uniqueness-checks a desired one. The
-- edit token is generated here and returned RAW exactly once — only its hash is stored.
create function public.create_link(
  desired_slug text,
  kind text,
  server_url text,
  repo_url text,
  build_cmd text,
  run_target text,
  name text,
  description text,
  tagline text
) returns table (slug text, edit_token uuid)
  language plpgsql volatile security definer set search_path = '' as $$
declare
  v_token   uuid := gen_random_uuid();
  v_minting boolean := (desired_slug is null or btrim(desired_slug) = '');
  v_slug    text;
  v_tries   int := 0;
begin
  if kind not in ('http', 'stdio') then
    raise exception 'invalid kind: %', kind using errcode = '22023';
  end if;

  if not v_minting then
    v_slug := lower(btrim(desired_slug));
    if not public._slug_valid(v_slug) then
      raise exception 'invalid slug: %', v_slug using errcode = '22023';
    end if;
  end if;

  loop
    if v_minting then
      v_slug := public._mint_slug();
    end if;
    begin
      insert into public.links (
        slug, kind, server_url, repo_url, build_cmd, run_target,
        name, description, tagline, edit_token_hash
      ) values (
        v_slug, kind, server_url, repo_url, build_cmd, run_target,
        name, description, tagline, public._edit_token_hash(v_token)
      );
      return query select v_slug, v_token;
      return;
    exception when unique_violation then
      if not v_minting then
        raise exception 'slug taken: %', v_slug using errcode = '23505';
      end if;
      v_tries := v_tries + 1;
      if v_tries > 25 then
        raise exception 'could not mint a free slug' using errcode = '23505';
      end if;
    end;
  end loop;
end;
$$;

-- Edit a link, authorized by the token. Transport (kind) is immutable here. Returns the updated public
-- projection, or no row when the token matches nothing (unauthorized / not found).
create function public.update_link(
  token uuid,
  new_slug text,
  new_server_url text,
  new_repo_url text,
  new_build_cmd text,
  new_run_target text,
  new_name text,
  new_description text,
  new_tagline text
) returns table (
  slug text, kind text, server_url text, repo_url text, build_cmd text,
  run_target text, name text, description text, tagline text
) language plpgsql volatile security definer set search_path = '' as $$
declare
  v_id   uuid;
  v_slug text := lower(btrim(new_slug));
begin
  select l.id into v_id from public.links l
  where l.edit_token_hash = public._edit_token_hash(token) and l.deleted_at is null;
  if v_id is null then
    return;
  end if;

  if not public._slug_valid(v_slug) then
    raise exception 'invalid slug: %', v_slug using errcode = '22023';
  end if;
  if exists (
    select 1 from public.links l
    where l.slug = v_slug and l.deleted_at is null and l.id <> v_id
  ) then
    raise exception 'slug taken: %', v_slug using errcode = '23505';
  end if;

  update public.links set
    slug        = v_slug,
    server_url  = new_server_url,
    repo_url    = new_repo_url,
    build_cmd   = new_build_cmd,
    run_target  = new_run_target,
    name        = new_name,
    description = new_description,
    tagline     = new_tagline,
    updated_at  = now()
  where id = v_id;

  return query
    select l.slug, l.kind, l.server_url, l.repo_url, l.build_cmd,
           l.run_target, l.name, l.description, l.tagline
    from public.links l where l.id = v_id;
end;
$$;

-- Soft-delete a link, authorized by the token. Returns whether a live row was removed.
create function public.delete_link(token uuid)
returns boolean language plpgsql volatile security definer set search_path = '' as $$
declare v_count int;
begin
  update public.links set deleted_at = now()
  where edit_token_hash = public._edit_token_hash(token) and deleted_at is null;
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

-- ── grants — the functions are the only access path ──────────────────────────────────────────────────
-- Strip the default PUBLIC execute, then grant each RPC to exactly the role that should call it. The
-- helpers get no grant: they run inside the definer RPCs, as owner.

revoke all on function public._edit_token_hash(uuid) from public;
revoke all on function public._slug_valid(text) from public;
revoke all on function public._mint_slug() from public;

revoke all on function public.slug_available(text) from public;
revoke all on function public.get_public_link(text) from public;
revoke all on function public.get_link_for_edit(uuid) from public;
revoke all on function public.update_link(uuid, text, text, text, text, text, text, text, text) from public;
revoke all on function public.delete_link(uuid) from public;
revoke all on function public.create_link(text, text, text, text, text, text, text, text, text) from public;

grant execute on function public.slug_available(text) to anon;
grant execute on function public.get_public_link(text) to anon;
grant execute on function public.get_link_for_edit(uuid) to anon;
grant execute on function public.update_link(uuid, text, text, text, text, text, text, text, text) to anon;
grant execute on function public.delete_link(uuid) to anon;

-- create runs only from the service-role create edge (Turnstile-gated), never the browser.
grant execute on function public.create_link(text, text, text, text, text, text, text, text, text) to service_role;
