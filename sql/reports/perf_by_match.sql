-- CAR-4 · tops_perf readout 1: one line per match for one player, last N hours (read-only).
-- Run through the Supabase SQL tool (service connection). Edit ONLY the params line: player name (as saved in the game)
-- or a user_id, and the hours to look back.
-- One line per match: the match-end row if it arrived, else its latest checkpoint (30 s / interrupted).
-- Sessions: rows carry no session id, so a new session starts whenever match_index doesn't go up (the app was reopened).
-- Matches are ordered by their estimated start (upload time minus match length): a row uploaded late from the phone's
-- queue still lands in the right place within its session.
-- Columns: slow33_pct / slow100_pct = share of frames over 33 ms / 100 ms or more, from frame_hist
-- (bins in ms: <9, 9-12, 13-17, 18-20, 21-25, 26-33, 34-50, 51-100, 101-199, >=200).
with params as (select 'Hayden'::text as player, null::uuid as uid, 24::int as hours),
who as (
  select coalesce(p.uid, (select s.user_id from public.tops_saves s where s.data->>'name' ilike p.player
                          order by s.updated_at desc limit 1)) as user_id, p.hours
  from params p),
picked as (
  select t.*, row_number() over (partition by t.match_id order by (t.phase = 'end') desc, t.at desc) as rn
  from public.tops_perf t join who w on t.user_id = w.user_id
  where t.at > now() - make_interval(hours => w.hours)),
m as (
  select p.*, p.at - make_interval(secs => coalesce(p.secs, 0)) as started
  from picked p where p.rn = 1),
seq as (
  select m.*, lag(m.match_index) over (order by m.started) as prev_ix from m),
sess as (
  select seq.*, sum(case when prev_ix is null or match_index is null or match_index <= prev_ix then 1 else 0 end)
                  over (order by started rows unbounded preceding) as session_n
  from seq)
select session_n,
       match_index,
       to_char(started at time zone 'Pacific/Auckland', 'DD Mon HH24:MI') as started_nz,
       ver, phase, status, mode, tier, standalone,
       dev->>'device_class' as device,
       fps, p50, p95, p99, stalls100, max_ms,
       reticle_p50, reticle_p95, reticle_max,
       draws_max, tris_max, heap_mb,
       geometries, textures, programs,
       frame_hist,
       round(100.0 * (frame_hist[7] + frame_hist[8] + frame_hist[9] + frame_hist[10]) / nullif(frame_n, 0), 1) as slow33_pct,
       round(100.0 * (frame_hist[9] + frame_hist[10]) / nullif(frame_n, 0), 1) as slow100_pct,
       audio_issue_n,
       match_id
from sess
order by started;
