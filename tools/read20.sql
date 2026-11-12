-- R0 #20 one-command reader: Hayden's first two matches on one page after a time, match 1 vs match 2 side by side.
-- Run in the Supabase SQL editor (or execute_sql). Edit only the two values in `p` (who, and from when; NZ time).
-- Reads tops_perf (fps, p50/p95, stalls, frame split per 30 s window, 20d's tilt listener and image caches, listeners, renders)
-- and tops_log (CAR-6 slow frames: our JS / render submit / other, with the frame split's aj/rb when the switch was on).
-- How to read the frame split (`split w*` rows, switch on): [our frame ms/s, our JS outside the frame ms/s, readback probe ms/s,
-- unclassified ms/s, readback p50, p90, n]. Match 2 vs 1: readback p50 up = GPU slower for the same work; our-JS-outside up = our
-- timers/handlers; only unclassified up = WebKit itself (style/paint/compositor/GC) -> next step is Safari Web Inspector on the phone.
with p as (select '0ae81554-9088-42d4-8229-6bb4a60638d2'::uuid as uid, timestamptz '2026-11-13 06:00:00+13' as since),
m1 as (select t.* from tops_perf t, p where t.user_id=p.uid and t.at>=p.since and t.phase='end' and coalesce(t.status,'')<>'interrupted' and t.match_index=1 order by t.at limit 1),
m2 as (select t.* from tops_perf t, p, m1 where t.user_id=p.uid and t.at>m1.at and t.phase='end' and coalesce(t.status,'')<>'interrupted' and t.match_index=2 order by t.at limit 1),
mm as (select 1 as n, * from m1 union all select 2, * from m2),
kv as (
  select n, k, v from mm, lateral (values
    ('when (NZ)', to_char(at at time zone 'Pacific/Auckland','HH24:MI:SS')),
    ('version', ver),
    ('status · secs visible', coalesce(status,'')||' · '||coalesce(visible_secs::text,'')),
    ('switches (q20)', coalesce(dev->'t20'->>'q20','none')),
    ('fps', round(fps::numeric,1)::text),
    ('p50 / p95 ms', p50||' / '||p95),
    ('stalls >100 ms', stalls100::text),
    ('frame_hist', frame_hist::text),
    ('render_p95 ms', render_p95::text),
    ('30 s windows [s,fps,p95,stalls,p50,(split)]', dev->'t20'->>'fps_30s'),
    ('split w1', (dev->'t20'->'fps_30s'->0->5)::text),
    ('split w2', (dev->'t20'->'fps_30s'->1->5)::text),
    ('tilt listener [attached, body class, events]', (dev->'t20'->'cnt'->'gyro')::text),
    ('image caches', (dev->'t20'->'cnt'->'imgc')::text),
    ('listeners [all, non-passive hot]', (dev->'t20'->'cnt'->'lsn')::text),
    ('gpu [geo,tex,prog] at 10 s', (dev->'t20'->'cnt'->'gpu')::text),
    ('lights', (dev->'t20'->'cnt'->'lights')::text),
    ('canvases · full-screen layers · css anims', concat_ws(' · ', dev->'t20'->'cnt'->>'canv', dev->'t20'->'cnt'->>'full', dev->'t20'->'cnt'->>'css')),
    ('renders per frame (rpf)', (dev->'t20'->'rpf')::text),
    ('canvas [w,h,cssW,cssH,bufW,bufH,pr,dpr]', (dev->'t20'->'cv')::text),
    ('between matches [secs,fps,renders/s]', concat_ws(',', dev->'t20'->'idle'->>'secs', dev->'t20'->'idle'->>'fps', dev->'t20'->'idle'->>'renders_ps')),
    ('worst slow frames (incidents)', left(incidents::text, 600))
  ) as x(k, v)
),
pg as (  -- the flight-recorder page that holds match 1 (closest log row in time)
  select l.page_id from tops_log l, p, m1 where l.user_id=p.uid and l.at between m1.at - interval '20 minutes' and m1.at + interval '20 minutes'
  order by abs(extract(epoch from l.at - m1.at)) limit 1
),
ev as (select distinct (e->>'q')::int as q, e->>'k' as k, e->'d' as d
  from tops_log l join pg using (page_id) cross join lateral jsonb_array_elements(l.events) e where e->>'k' in ('match_start','slow_sum')),
ss as (select ev.d, (select (s.d->>'n')::int from ev s where s.k='match_start' and s.q<ev.q order by s.q desc limit 1) as n from ev where ev.k='slow_sum'),
lg as (  -- CAR-6 slow frames (>50 ms) per match on that page: count and the median split [frame, our JS, render submit, other]
  select n, count(*) as slow_n,
    percentile_cont(.5) within group (order by (f->>1)::float) as f_med,
    percentile_cont(.5) within group (order by (f->>2)::float) as js_med,
    percentile_cont(.5) within group (order by (f->>3)::float) as rnd_med,
    percentile_cont(.5) within group (order by (f->>4)::float) as other_med
  from ss cross join lateral jsonb_array_elements(ss.d->'f') f where n in (1,2) group by n
)
select k as metric,
  max(case when n=1 then v end) as match_1,
  max(case when n=2 then v end) as match_2
from (
  select n, k, v from kv
  union all select n, 'slow frames >50 ms (flight recorder): n · median f/js/render/other ms', slow_n||' · '||round(f_med::numeric)||'/'||round(js_med::numeric,1)||'/'||round(rnd_med::numeric,1)||'/'||round(other_med::numeric) from lg
) z
group by k
order by min(case k
  when 'when (NZ)' then 1 when 'version' then 2 when 'status · secs visible' then 3 when 'switches (q20)' then 4 when 'fps' then 5 when 'p50 / p95 ms' then 6
  when 'stalls >100 ms' then 7 when 'frame_hist' then 8 when 'render_p95 ms' then 9 when '30 s windows [s,fps,p95,stalls,p50,(split)]' then 10
  when 'split w1' then 11 when 'split w2' then 12 when 'tilt listener [attached, body class, events]' then 13 when 'image caches' then 14
  else 20 end), k;
