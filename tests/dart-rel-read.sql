-- CAR-5c: green throws far from the target, split by a freeze around the press / release (flight recorder 'match_dart' events, 3.28+).
-- gp: longest frame gap in the 500 ms before the press (the lock is taken at the press); gpl: during the pull; lag=1: the lock used the
-- frame on screen after a stall; a/k/l/s/g/r: aim, lock, land, shown reticle at press, game sway at press, sway at release (board mm).
with d as (
  select l.user_id, l.ver, (e->'d') x from tops_log l, jsonb_array_elements(l.events) e where e->>'k' = 'match_dart'
), m as (
  select user_id, ver, (x->>'pf')::int pf, (x->>'gp')::int gp, (x->>'gpl')::int gpl, (x->>'lag')::int lag,
    sqrt(power((x->'l'->>0)::float-(x->'a'->>0)::float,2)+power((x->'l'->>1)::float-(x->'a'->>1)::float,2)) da,
    sqrt(power((x->'k'->>0)::float-(x->'a'->>0)::float,2)+power((x->'k'->>1)::float-(x->'a'->>1)::float,2)) la
  from (select distinct on (user_id, x) * from d) q
)
select user_id, case when gp>=150 or gpl>=150 then 'freeze >=150 ms near the throw' else 'no freeze' end as frames,
  count(*) greens, round(100.0*avg(case when da>20 then 1 else 0 end),1) pct_far, round(avg(lag)*100,1) pct_lag,
  round(percentile_cont(.5) within group (order by la)::numeric,1) lock_to_target_p50
from m where pf=1 group by 1,2 order by 1,2;
-- note: a match's log is uploaded at match end and again on pagehide, so the same event can appear in two uploads (distinct on above).
