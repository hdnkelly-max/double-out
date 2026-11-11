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
  secs int, visible_secs real, frame_n int, refresh_hz int,
  fps real, p50 real, p95 real, p99 real, pct33 real, pct50 real, stalls100 int, max_ms int,
  render_p95 real,
  reticle_p50 real, reticle_p95 real, reticle_max int, reticle_n int, reticle_slow int,
  audio_issue_n int, audio jsonb,
  drift_max int, drift_n int, lt_n int, lt_ms int,
  draws_max int, tris_max int, heap_mb real,
  incidents jsonb, dev jsonb
);
create index if not exists tops_perf_ver_at on public.tops_perf (ver, at);
alter table public.tops_perf enable row level security;
drop policy if exists tops_perf_insert_own on public.tops_perf;
create policy tops_perf_insert_own on public.tops_perf for insert to authenticated with check (user_id = (select auth.uid()));
grant insert on public.tops_perf to authenticated;
grant usage, select on sequence public.tops_perf_id_seq to authenticated;
