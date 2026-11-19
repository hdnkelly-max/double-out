-- CAR-TUNE read-out (Overseer 19:45): one row per Circuit level (and curve flag) with the evidence for a window nudge.
-- select * from tops_s3_levels;
--   players, matches, avg, opp_avg, perfect_pct (Season 3 career darts at that tier), entry/exit win % (each player's first and last
--   third of matches at the level), the live win_scale / ramp_ms from tops_tune, a suggested win_scale (at most 10% per step) and a
--   confidence flag. Targets: ~50% wins on entry, 65-70% (67) by the exit; the Palace also aims at a ~100 average.
-- Sensitivity (sim, mid-skill profile, 600 matches a cell, through the real throw; see the CAR-PULL tracker row):
--   win_scale (scales the perfect window and the ramp together): ~2 win-% points per 10% at the Pub, ~6-8 at the Palace; ~1.6 average points.
--   ramp_ms: ~6 win-% points per 10 ms at the Pub; ~2.3 average points per 10 ms at the Palace. So at the Pub the ramp is the stronger lever.
-- Suggestions move only with 20+ matches at the level and an error of 5+ points, and at most one step: win_scale 10%, ramp 10 ms. Pick one lever per tier per change.
-- tops_s3_matches now counts each s3_result once: the flight recorder re-sends its ring in later uploads, so the same event can sit in
-- several tops_log rows (same user, same session time t, same event id and round).
create or replace view public.tops_s3_matches as
select distinct on (l.user_id, x.e->>'t', x.e->'d'->>'id', x.e->'d'->>'round')
  l.user_id, coalesce(s.data->>'name', l.user_id::text) as who, l.ver, l.at, x.ord,
  (x.e->'d'->>'level')::int as level, x.e->'d'->>'id' as ev, x.e->'d'->>'round' as round,
  ((x.e->'d'->>'won')::int) = 1 as won,
  nullif(x.e->'d'->>'avg','')::numeric as avg, nullif(x.e->'d'->>'oavg','')::numeric as oavg,
  nullif(x.e->'d'->>'rh','')::int as rh, nullif(x.e->'d'->>'ct','')::int as ct,
  coalesce((x.e->'d'->>'curve')::int, 0) as curve
from public.tops_log l
cross join lateral jsonb_array_elements(l.events) with ordinality x(e, ord)
left join public.tops_saves_s3 s on s.user_id = l.user_id
where x.e->>'k' = 's3_result'
order by l.user_id, x.e->>'t', x.e->'d'->>'id', x.e->'d'->>'round', l.at;

create or replace view public.tops_s3_levels as
with k as (select 4.0::numeric as pts, 1.6::numeric as avgpts, 6.0::numeric as rpts, 2.3::numeric as ravg),  -- sim: win-% / average points per 10% of win_scale, and per 10 ms of ramp
m as (
  select *, row_number() over (partition by user_id, level, curve order by at, ord) as n,
         count(*) over (partition by user_id, level, curve) as tot
  from public.tops_s3_matches
), t as (
  select *, case when n <= ceil(tot / 3.0) then 'first' when n > tot - ceil(tot / 3.0) then 'last' else 'mid' end as part from m
), lv as (
  select level, curve, count(distinct user_id) as players, count(*) as matches,
    round(100.0 * avg(won::int) filter (where part = 'first')) as entry_win_pct,
    round(100.0 * avg(won::int) filter (where part = 'last')) as exit_win_pct,
    round(avg(avg), 1) as avg, round(avg(oavg), 1) as opp_avg
  from t group by level, curve
), d as (  -- Season 3 career darts (4.00 builds on; Season 3 is the default there) by tier
  select tier as level, round(100.0 * avg(perfect::int)) as perfect_pct, count(*) as darts
  from public.tops_darts where mode = 'career' and ver ~ '^\d+$' and ver::bigint >= 1795047974858 group by tier
), e as (
  select lv.*, d.perfect_pct, d.darts, tt.win_scale, tt.ramp_ms,
    ((coalesce(lv.entry_win_pct, lv.exit_win_pct) - 50) + (coalesce(lv.exit_win_pct, lv.entry_win_pct) - 67)) / 2.0 as win_err,
    case when lv.level = 6 and lv.avg is not null then lv.avg - 100 end as avg_err
  from lv left join d using (level) left join public.tops_tune tt on tt.tier = lv.level
)
select e.level,
  case e.level when 0 then 'Pub' when 1 then 'Club' when 2 then 'Regional' when 3 then 'DPNZ' when 4 then 'Trans-Tasman' when 5 then 'Pro Tour' else 'Palace' end as level_name,
  e.curve, e.players, e.matches, e.avg, e.opp_avg, e.perfect_pct, e.darts,
  e.entry_win_pct, e.exit_win_pct,
  abs(coalesce(e.entry_win_pct, 999) - 50) <= 10 and abs(coalesce(e.exit_win_pct, 999) - 67) <= 10 as on_target,
  e.matches >= 20 as enough_data,
  coalesce(e.win_scale, 1) as win_scale, coalesce(e.ramp_ms, 40) as ramp_ms,
  -- too many wins -> a smaller window (and the reverse), at most 10% a step, only when 5+ points off
  case when e.win_err is null or e.matches < 20 or (abs(e.win_err) < 5 and coalesce(abs(e.avg_err), 0) < 5) then coalesce(e.win_scale, 1)
       else round(coalesce(e.win_scale, 1) * (1 - greatest(-0.10, least(0.10,
              (case when e.avg_err is not null then (e.win_err / k.pts + e.avg_err / k.avgpts) / 2 else e.win_err / k.pts end) * 0.10))), 3)
  end as suggested_win_scale,
  case when e.win_err is null or e.matches < 20 or (abs(e.win_err) < 5 and coalesce(abs(e.avg_err), 0) < 5) then coalesce(e.ramp_ms, 40)
       else greatest(0, least(120, round(coalesce(e.ramp_ms, 40) - greatest(-10, least(10,
              (case when e.avg_err is not null then (e.win_err / k.rpts + e.avg_err / k.ravg) / 2 else e.win_err / k.rpts end) * 10)))))
  end as suggested_ramp_ms,
  case when e.matches >= 50 and e.players >= 3 then 'high' when e.matches >= 20 and e.players >= 2 then 'medium' else 'low' end as confidence,
  round(e.win_err, 1) as win_err_pts, round(e.avg_err, 1) as avg_err
from e cross join k
order by e.level, e.curve;
revoke all on public.tops_s3_matches, public.tops_s3_levels from anon, authenticated;
