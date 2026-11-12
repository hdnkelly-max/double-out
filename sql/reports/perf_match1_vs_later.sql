-- CAR-4 · tops_perf readout 2: match 1 vs matches 2+ in the same app session, for one player (read-only).
-- Answers "does it get worse from match 2?" in one line per session. Edit ONLY the params line.
-- Same match picking and session rule as perf_by_match.sql. "later" = the average over matches 2, 3, ...
-- delta = later minus match 1 (positive p95 / stalls / reticle / slow % / memory = worse after match 1;
-- negative fps = worse). A session with only one match shows nulls in the "later" columns.
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
  select p.*, p.at - make_interval(secs => coalesce(p.secs, 0)) as started,
         100.0 * (p.frame_hist[7] + p.frame_hist[8] + p.frame_hist[9] + p.frame_hist[10]) / nullif(p.frame_n, 0) as slow33
  from picked p where p.rn = 1),
seq as (
  select m.*, lag(m.match_index) over (order by m.started) as prev_ix from m),
sess as (
  select seq.*, sum(case when prev_ix is null or match_index is null or match_index <= prev_ix then 1 else 0 end)
                  over (order by started rows unbounded preceding) as session_n
  from seq),
ranked as (
  select sess.*, row_number() over (partition by session_n order by started) as k from sess)
select session_n,
       to_char(min(started) at time zone 'Pacific/Auckland', 'DD Mon HH24:MI') as session_start_nz,
       min(ver) as ver, bool_or(standalone) as standalone, min(dev->>'device_class') as device,
       count(*) as matches,
       round(max(fps)         filter (where k = 1)::numeric, 1) as fps_m1,
       round(avg(fps)         filter (where k > 1)::numeric, 1) as fps_later,
       round(max(p95)         filter (where k = 1)::numeric, 1) as p95_m1,
       round(avg(p95)         filter (where k > 1)::numeric, 1) as p95_later,
       round(max(p99)         filter (where k = 1)::numeric, 1) as p99_m1,
       round(avg(p99)         filter (where k > 1)::numeric, 1) as p99_later,
       max(stalls100)         filter (where k = 1) as stalls100_m1,
       round(avg(stalls100)   filter (where k > 1)::numeric, 1) as stalls100_later,
       round(max(reticle_p95) filter (where k = 1)::numeric, 1) as reticle_p95_m1,
       round(avg(reticle_p95) filter (where k > 1)::numeric, 1) as reticle_p95_later,
       round(max(slow33)      filter (where k = 1)::numeric, 1) as slow33_pct_m1,
       round(avg(slow33)      filter (where k > 1)::numeric, 1) as slow33_pct_later,
       max(draws_max)         filter (where k = 1) as draws_m1,
       round(avg(draws_max)   filter (where k > 1)::numeric, 0) as draws_later,
       max(geometries)        filter (where k = 1) as geometries_m1,
       max(geometries)        filter (where k > 1) as geometries_later_max,
       max(textures)          filter (where k = 1) as textures_m1,
       max(textures)          filter (where k > 1) as textures_later_max,
       round((avg(p95) filter (where k > 1) - max(p95) filter (where k = 1))::numeric, 1) as p95_delta,
       round((avg(reticle_p95) filter (where k > 1) - max(reticle_p95) filter (where k = 1))::numeric, 1) as reticle_p95_delta,
       round((avg(fps) filter (where k > 1) - max(fps) filter (where k = 1))::numeric, 1) as fps_delta
from ranked
group by session_n
order by session_n;
