-- tops_perf: live performance telemetry (Hayden 06:54, 12 Nov; v13.js). Two rows per match (30 s checkpoint + end).
-- Insert-only for players (their own rows); no client select/update/delete. Reporting reads through the service connection.
create table if not exists public.tops_perf (
  id bigserial primary key,
  sample_id text not null unique,            -- client-made; retries never duplicate (on conflict do nothing)
  match_id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  ver text, build text, schema_ver int,
  phase text check (phase in ('30s','end')),
  status text check (status in ('partial','complete','quit','closed','interrupted')),
  mode text, tier text,
  secs int, visible_secs real, frame_n int, refresh_hz int,   -- refresh_hz: observed cadence from the median frame, not the display's setting
  fps real, p50 real, p95 real, p99 real, pct33 real, pct50 real, stalls100 int, max_ms int,
  render_p95 real,
  reticle_p50 real, reticle_p95 real, reticle_max int, reticle_n int, reticle_slow int,
  audio_issue_n int, audio jsonb,
  drift_max int, drift_n int, lt_n int, lt_ms int,
  draws_max int, tris_max int, heap_mb real,
  incidents jsonb, dev jsonb,
  -- per-match memory (Overseer 07:56, #15: does anything grow from match 2 on?)
  match_index int,          -- 1, 2, 3 ... matches since the app opened
  app_secs int,             -- seconds since the app opened, at match start
  geometries int, textures int, programs int,   -- three.js renderer.info at the time of the row
  tex_mb real,              -- always null since QA 08:23 (no texture-upload patching); kept so older rows stay readable
  mem jsonb,                -- {now:{geo,tex,prog,tex_mb,heap_mb}, start:{...}} so growth within a match is visible
  frames_over200 int, q_dropped int,
  frame_hist int[],         -- frame intervals per match in 10 bins (ms): <9, 9-12, 13-17, 18-20, 21-25, 26-33, 34-50, 51-100, 101-199, >=200
  standalone boolean        -- home-screen web app (iOS navigator.standalone / display-mode standalone); null if unknown
);
-- if the table already exists from an earlier draft of this migration
alter table public.tops_perf add column if not exists match_index int, add column if not exists app_secs int,
  add column if not exists geometries int, add column if not exists textures int, add column if not exists programs int,
  add column if not exists tex_mb real, add column if not exists mem jsonb,
  add column if not exists frames_over200 int, add column if not exists q_dropped int,
  add column if not exists frame_hist int[], add column if not exists standalone boolean;
create index if not exists tops_perf_ver_at on public.tops_perf (ver, at);
alter table public.tops_perf enable row level security;
drop policy if exists tops_perf_insert_own on public.tops_perf;
create policy tops_perf_insert_own on public.tops_perf for insert to authenticated with check (user_id = (select auth.uid()));
grant insert on public.tops_perf to authenticated;
grant usage, select on sequence public.tops_perf_id_seq to authenticated;
