-- Bound the free-text link fields at the database — the authority both write paths share: create_link
-- (service-role, through the edge endpoint) and update_link (token-authorized, callable straight from the
-- browser with a valid edit token). The edge validates lengths too, but the edit path never passes through
-- it, so these CHECK constraints are what actually stop an over-long write on an existing link. tagline
-- already carries its own char_length(...) <= 70 check from the table's creation.
--
-- Caps match the edge's LIMITS. They are generous (a real name/description/command/URL fits comfortably);
-- the point is a ceiling, not a tight bound. Adding them is safe: the table holds no rows that could
-- violate them.

alter table public.links
  add constraint links_name_len check (name is null or char_length(name) <= 80),
  add constraint links_description_len check (description is null or char_length(description) <= 280),
  add constraint links_server_url_len check (server_url is null or char_length(server_url) <= 2048),
  add constraint links_repo_url_len check (repo_url is null or char_length(repo_url) <= 2048),
  add constraint links_build_cmd_len check (build_cmd is null or char_length(build_cmd) <= 500),
  add constraint links_run_target_len check (run_target is null or char_length(run_target) <= 500);
