-- R0 #20 morning reader: Hayden's first two iPhone matches on one page after a time, match 1 vs match 2 side by side, plus a verdict.
-- Run: paste into the Supabase SQL editor (project thyirfwoqkshsaqowdpe) and Run, or ask Engine (execute_sql). Edit only the `p` line:
--   since   = from when (NZ time). Default 06:00 today.
--   min_ver = lowest build to count (default 3.26: #20e live). want_sa = true for the home-screen app only, null for app or Safari.
-- Only iPhone rows count (dev.os = 'iOS'), so desktop/Chrome sessions (e.g. the Overseer's 03:08 launch check) never get picked.
-- Match 1 = the first finished, not-interrupted match_index 1 after `since`; match 2 = the next finished match_index 2 on the same
-- build and the same app/Safari mode. Interrupted or abandoned rows are skipped.
-- Frame split (switch on, hub Menu "Test: frame split"): per 30 s window [our frame ms/s, our JS outside the frame ms/s, readback probe
-- ms/s, unclassified ms/s, readback p50, p90, n]. Read match 2 vs 1: readback p50 up = GPU slower for the same work; our-JS-outside up =
-- our timers/handlers; only unclassified up = WebKit itself (style/paint/compositor/GC). iOS has no GC counter: GC shows up as unclassified.
with p as (select '0ae81554-9088-42d4-8229-6bb4a60638d2'::uuid as uid, timestamptz '2026-11-13 06:00:00+13' as since,
                  '{3,26}'::int[] as min_ver, null::boolean as want_sa),
ok as (select t.* from tops_perf t, p where t.user_id=p.uid and t.at>=p.since and t.phase='end' and coalesce(t.status,'') not in ('interrupted','abandoned')
        and t.dev->>'os'='iOS' and string_to_array(t.ver,'.')::int[]>=p.min_ver and (p.want_sa is null or t.standalone=p.want_sa)),
m1 as (select * from ok where match_index=1 order by at limit 1),
m2 as (select ok.* from ok, m1 where ok.match_index=2 and ok.at>m1.at and ok.ver=m1.ver and ok.standalone is not distinct from m1.standalone order by ok.at limit 1),
mm as (select 1 as n, * from m1 union all select 2, * from m2),
-- frame split averaged over the match's 30 s windows (null when the switch was off)
sp as (select n, count(w) as wn, avg((w->5->>0)::float) raf, avg((w->5->>1)::float) ajs, avg((w->5->>2)::float) prb, avg((w->5->>3)::float) uncl, avg((w->5->>4)::float) rb50
       from mm cross join lateral jsonb_array_elements(coalesce(mm.dev->'t20'->'fps_30s','[]'::jsonb)) w where jsonb_typeof(w->5)='array' group by n),
-- flight recorder: the iPhone page that holds match 1, its slow frames (>50 ms) per match: [frame, our JS, render submit, other]
pg as (select l.page_id from tops_log l, p, m1 where l.user_id=p.uid and l.at between m1.at - interval '20 minutes' and m1.at + interval '20 minutes'
        and exists (select 1 from tops_log b cross join lateral jsonb_array_elements(b.events) e where b.page_id=l.page_id and e->>'k'='boot' and e->'d'->>'os'='iOS')
        order by abs(extract(epoch from l.at - m1.at)) limit 1),
ev as (select distinct (e->>'q')::int as q, e->>'k' as k, e->'d' as d from tops_log l join pg using (page_id) cross join lateral jsonb_array_elements(l.events) e where e->>'k' in ('match_start','slow_sum')),
ss as (select ev.d, (select (s.d->>'n')::int from ev s where s.k='match_start' and s.q<ev.q order by s.q desc limit 1) as n from ev where ev.k='slow_sum'),
lg as (select n, count(*) slow_n, percentile_cont(.5) within group (order by (f->>1)::float) f_med, percentile_cont(.5) within group (order by (f->>2)::float) js_med,
        percentile_cont(.5) within group (order by (f->>3)::float) rnd_med, percentile_cont(.5) within group (order by (f->>4)::float) other_med
       from ss cross join lateral jsonb_array_elements(ss.d->'f') f where n in (1,2) group by n),
kv as (
  select n, o, k, v from mm, lateral (values
    (1,'when (NZ)', to_char(at at time zone 'Pacific/Auckland','HH24:MI:SS')),
    (2,'build · app or Safari', ver||' · '||case when standalone then 'home-screen app' else 'Safari tab' end),
    (3,'status · secs visible', coalesce(status,'')||' · '||coalesce(round(visible_secs)::text,'')),
    (4,'test switches (q20)', coalesce(dev->'t20'->>'q20','none')),
    (5,'fps', round(fps::numeric,1)::text),
    (6,'p50 / p95 / p99 ms', concat_ws(' / ',p50,p95,p99)),
    (7,'stalls >100 ms · worst ms', stalls100||' · '||coalesce(max_ms::text,'')),
    (8,'frame histogram', frame_hist::text),
    (9,'render p95 ms', render_p95::text),
    (10,'30 s windows [s, fps, p95, stalls, p50]', (select string_agg('['||concat_ws(',',w->>0,w->>1,w->>2,w->>3,w->>4)||']',' ') from jsonb_array_elements(coalesce(dev->'t20'->'fps_30s','[]'::jsonb)) w)),
    (14,'tilt listener [attached, body class, events] (20d: [0,..] in a match)', coalesce((dev->'t20'->'cnt'->'gyro')::text,'not logged')),
    (15,'image caches (20d: portrait ≤40, hero ≤4, dart ≤16)', coalesce((dev->'t20'->'cnt'->'imgc')::text,'not logged')),
    (16,'#20e allocation', 'not logged on the phone (no recorder field; Chromium numbers on Engine''s board)'),
    (17,'JS heap MB (iOS: none)', coalesce(heap_mb::text, (dev->'t20'->'cnt'->>'heap'), 'n/a')),
    (18,'listeners [all, non-passive hot]', (dev->'t20'->'cnt'->'lsn')::text),
    (19,'GPU [geo, tex, prog] · lights', concat_ws(' · ',(dev->'t20'->'cnt'->'gpu')::text,(dev->'t20'->'cnt'->'lights')::text)),
    (20,'renders per frame', (dev->'t20'->'rpf')::text),
    (21,'canvas [w,h,cssW,cssH,bufW,bufH,pr,dpr]', (dev->'t20'->'cv')::text),
    (22,'between matches [secs, fps, renders/s]', concat_ws(',', dev->'t20'->'idle'->>'secs', dev->'t20'->'idle'->>'fps', dev->'t20'->'idle'->>'renders_ps'))
  ) as x(o, k, v)
  union all select n, 11, 'frame split, avg ms/s: our frame · our JS outside · probe · unclassified · readback p50 ms',
    case when wn>0 then concat_ws(' · ',round(raf::numeric,1),round(ajs::numeric,1),round(prb::numeric,1),round(uncl::numeric,1),round(rb50::numeric,2)) end from sp
  union all select n, 12, 'slow frames >50 ms (flight recorder): n · median frame / our JS / render / other ms',
    slow_n||' · '||round(f_med::numeric)||' / '||round(js_med::numeric,1)||' / '||round(rnd_med::numeric,1)||' / '||round(other_med::numeric) from lg
),
-- verdict: is match 2 within 10% of match 1, and what the split points at
f1 as (select fps, p95 from m1), f2 as (select fps, p95 from m2), s1 as (select * from sp where n=1), s2 as (select * from sp where n=2),
verdict as (
  select 0 as o, 'VERDICT' as metric,
    case when (select fps from f2) is null then 'match 2 not found yet (needs two finished iPhone matches after since, same build)'
         when (select fps from f2) >= 0.9*(select fps from f1) then 'YES: match 2 is within 10% of match 1 ('||round(100*(select fps from f2)/(select fps from f1))::text||'% of its fps)'
         else 'NO: match 2 is '||round(100-100*(select fps from f2)/(select fps from f1))::text||'% slower than match 1' end as match_1,
    case when (select wn from s2) is null or (select wn from s1) is null then 'frame split off for this pair (hub Menu "Test: frame split", reopen the app)'
         when (select rb50 from s2) > 1.2*(select rb50 from s1) then 'split: readback p50 up '||round(100*((select rb50 from s2)/(select rb50 from s1)-1))::text||'%: GPU slower for the same work'
         when (select ajs from s2)-(select ajs from s1) > greatest(1,0.5*((select uncl from s2)-(select uncl from s1))) then 'split: our JS outside the frame grew most: our timers/handlers'
         when (select uncl from s2) > (select uncl from s1) then 'split: only unclassified grew ('||round(((select uncl from s2)-(select uncl from s1))::numeric,1)::text||' ms/s), readback flat: WebKit itself (style/paint/compositor/GC) -> Safari Web Inspector'
         else 'split: no component grew' end as match_2
)
select metric, match_1, match_2 from (
  select o, metric, match_1, match_2 from verdict
  union all
  select min(kv.o), kv.k, max(case when kv.n=1 then kv.v end), max(case when kv.n=2 then kv.v end)
  from kv group by kv.k
) z order by o, metric;
