-- tops_log: flight recorder (v14.js; Hayden via Overseer 08:01, 12 Nov). One row per upload: the last <=300 events of a session.
-- Insert-only for players (their own rows); no client select/update/delete. 30-day retention by pg_cron (installed on this project).
create table if not exists public.tops_log (
  id bigserial primary key,
  upload_id text not null unique,          -- client-made; the hidden + pagehide pair and retries never duplicate
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  session_id text not null,                -- logical session (survives a reload in the same tab)
  page_id text,                            -- this document load
  schema_ver int,
  ver text,
  reason text check (reason in ('error','match_end','pagehide')),
  dropped int,                             -- events pushed out of the 300-slot ring this session
  suppressed jsonb,                        -- per kind: noisy events over the 20-a-minute budget
  seq_first int, seq_last int,             -- event sequence numbers in this row (rows overlap; use these to stitch)
  trimmed_events int,                      -- oldest events cut to keep the body under 48 KiB
  bytes int,
  events jsonb not null,
  constraint tops_log_size check (octet_length(events::text) <= 60000)  -- the client keeps the whole body under 48 KiB
);
create index if not exists tops_log_user_at on public.tops_log (user_id, at desc);
alter table public.tops_log enable row level security;
drop policy if exists tops_log_insert_own on public.tops_log;
create policy tops_log_insert_own on public.tops_log for insert to authenticated with check (user_id = (select auth.uid()));
grant insert on public.tops_log to authenticated;
grant usage, select on sequence public.tops_log_id_seq to authenticated;
-- retention: delete rows older than 30 days, daily at 03:17 UTC
select cron.unschedule(jobid) from cron.job where jobname = 'tops_log_retention';
select cron.schedule('tops_log_retention', '17 3 * * *', $$delete from public.tops_log where at < now() - interval '30 days'$$);
