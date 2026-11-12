-- Performance report from tops_perf (v13 telemetry). Run through the Supabase tool (the shell can't reach Supabase), export the rows as JSON,
-- then: node tests/perf-read.js <file.json>   (or pipe the JSON in). One row per tester x device class x version x phase, last 7 days.
-- p95 is the MEDIAN OF PER-MATCH p95s (not a pooled p95); pct33 and stalls are pooled from counts; low sample counts are flagged by perf-read.js.
select coalesce(s.data->>'name', left(p.user_id::text, 8)) as tester,
       p.dev->>'device_class' as device_class,
       p.ver, p.phase,
       count(distinct p.match_id) as matches,
       round(sum(p.visible_secs)::numeric / 60, 1) as visible_min,
       round((sum(p.fps * p.visible_secs) / nullif(sum(p.visible_secs), 0))::numeric, 1) as fps,
       percentile_cont(0.5) within group (order by p.p95) as p95_median,
       round((sum(p.pct33 * p.frame_n) / nullif(sum(p.frame_n), 0))::numeric, 2) as pct33,
       sum(p.stalls100) as stalls100,
       max(p.max_ms) as max_ms,
       percentile_cont(0.5) within group (order by p.render_p95) as render_p95_median,
       percentile_cont(0.5) within group (order by p.reticle_p95) as reticle_p95_median,
       sum(p.reticle_slow) as reticle_slow,
       sum(p.audio_issue_n) as audio_issues,
       sum(coalesce((p.audio->>'underruns')::int, 0)) as underruns,
       max(p.drift_max) as drift_max,
       max(p.draws_max) as draws_max,
       max(p.tris_max) as tris_max,
       min(p.at) as first_at, max(p.at) as last_at
from public.tops_perf p
left join public.tops_saves s on s.user_id = p.user_id
where p.at > now() - interval '7 days'
group by 1, 2, 3, 4
order by 1, 2, 4, max(p.at);
