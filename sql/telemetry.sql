-- TOPS telemetry summary (read-only). Events live in each player's save.funnel (match_dart1, match_exit).
with ev as (
  select data->>'name' as player, e
  from tops_saves, jsonb_array_elements(coalesce(data->'funnel','[]'::jsonb)) e
  where (e->>'e') in ('match_dart1','match_exit') and (e->>'t')::bigint > extract(epoch from now() - interval '2 days')*1000
)
select player,
  count(*) filter (where e->>'e'='match_dart1') as starts_with_dart,
  round(avg((e->'d'->>'ms')::numeric) filter (where e->>'e'='match_dart1')/1000,1) as avg_secs_to_first_dart,
  count(*) filter (where e->>'e'='match_exit') as exits,
  count(*) filter (where e->>'e'='match_exit' and (e->'d'->>'threw')::int = 0) as exits_before_throwing,
  string_agg(distinct e->'d'->>'reason', ', ') filter (where e->>'e'='match_exit') as exit_reasons,
  round(avg((e->'d'->'perf'->>'fps')::numeric) filter (where e->>'e'='match_exit'),0) as avg_fps,
  round(avg((e->'d'->'perf'->>'p95ms')::numeric) filter (where e->>'e'='match_exit'),0) as p95_ms,
  round(avg((e->'d'->'perf'->>'longPct')::numeric) filter (where e->>'e'='match_exit'),1) as long_frame_pct,
  string_agg(distinct coalesce(e->'d'->'dev'->>'os','?')||' dpr'||coalesce(e->'d'->'dev'->>'dpr','?'), ', ') as devices
from ev group by player order by player;
