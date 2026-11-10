-- TOPS server referee: the server owns turn order, darts per visit, scores, legs and the result for online matches.
create table if not exists public.tops_ref (
  match_id text primary key,
  room text not null,
  state jsonb not null,
  log jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.tops_ref enable row level security;
-- no policies: only the security definer functions below touch it

create or replace function public.tops_ref_score(x double precision, y double precision)
returns jsonb language plpgsql immutable set search_path = public as $$
declare d double precision := sqrt(x*x+y*y); a double precision; n int;
  ord int[] := array[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
begin
  if d <= 6.35 then return jsonb_build_object('v',50,'m',2,'label','BULL','dbl',true); end if;
  if d <= 15.9 then return jsonb_build_object('v',25,'m',1,'label','25','dbl',false); end if;
  if d > 170 then return jsonb_build_object('v',0,'m',0,'label','MISS','dbl',false); end if;
  a := degrees(atan2(x,-y)); a := mod((a+360+9)::numeric, 360)::double precision;
  n := ord[(floor(a/18)::int % 20)+1];
  if d >= 162 then return jsonb_build_object('v',2*n,'m',2,'label','D'||n,'dbl',true); end if;
  if d >= 99 and d <= 107 then return jsonb_build_object('v',3*n,'m',3,'label','T'||n,'dbl',false); end if;
  return jsonb_build_object('v',n,'m',1,'label',n::text,'dbl',false);
end $$;

-- start (idempotent: the first call for a match id wins, later calls just return the state)
create or replace function public.tops_ref_start(p_match text, p_room text, p_cfg jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare st jsonb; np int; nt int; s0 int; teams boolean;
begin
  select state into st from tops_ref where match_id = p_match;
  if st is not null then return st; end if;
  np := jsonb_array_length(p_cfg->'players');
  if np < 2 or np > 6 then raise exception 'bad players'; end if;
  teams := coalesce((p_cfg->>'teams')::boolean,false);
  nt := case when teams then 2 else np end;
  s0 := coalesce((p_cfg->>'start')::int,501);
  if s0 not in (101,170,301,501,701) then s0 := 501; end if;
  st := jsonb_build_object(
    'v',0,'players',p_cfg->'players','teams',teams,'start',s0,
    'din',coalesce((p_cfg->>'din')::boolean,false),
    'need',greatest(1,ceil(coalesce((p_cfg->>'legs')::int,3)/2.0)::int),
    'cur',coalesce((p_cfg->>'first')::int,0) % np,'legStarter',coalesce((p_cfg->>'first')::int,0) % np,
    'dart',1,'visit','[]'::jsonb,
    'scores',(select jsonb_agg(s0) from generate_series(1,nt)),
    'visitStart',s0,
    'legs',(select jsonb_agg(0) from generate_series(1,nt)),
    'opened',(select jsonb_agg(not coalesce((p_cfg->>'din')::boolean,false)) from generate_series(1,nt)),
    'leg',1,'legDarts',(select jsonb_agg(0) from generate_series(1,nt)),
    'left','[]'::jsonb,'done',false,'winner',null,'last',null);
  insert into tops_ref(match_id,room,state) values (p_match,p_room,st) on conflict (match_id) do nothing;
  select state into st from tops_ref where match_id = p_match;
  return st;
end $$;

-- one dart. seq must be state.v+1; a repeat of an accepted seq returns the state unchanged (idempotent resend)
create or replace function public.tops_ref_dart(p_match text, p_key text, p_seq int, p_x double precision, p_y double precision, p_bo boolean default false)
returns jsonb language plpgsql security definer set search_path = public as $$
declare st jsonb; cur int; np int; si int; sc int; vs int; h jsonb; ns int; dbl boolean; bust boolean := false; won boolean := false;
  dart int; vis jsonb; keyAt text; legsArr jsonb; nt int; lg int;
begin
  select state into st from tops_ref where match_id = p_match for update;
  if st is null then return jsonb_build_object('err','no match'); end if;
  if (st->>'done')::boolean then return st || jsonb_build_object('err','done'); end if;
  if p_seq <= (st->>'v')::int then return st || jsonb_build_object('dup',true); end if;
  if p_seq <> (st->>'v')::int + 1 then return st || jsonb_build_object('err','out of order'); end if;
  np := jsonb_array_length(st->'players'); cur := (st->>'cur')::int;
  keyAt := st->'players'->>cur;
  if keyAt <> p_key then return st || jsonb_build_object('err','not your turn'); end if;
  dart := (st->>'dart')::int;
  si := case when (st->>'teams')::boolean then cur % 2 else cur end;
  sc := (st->'scores'->>si)::int; vs := (st->>'visitStart')::int;
  h := case when p_bo then jsonb_build_object('v',0,'m',0,'label','BOUNCE','dbl',false) else tops_ref_score(p_x,p_y) end;
  dbl := (h->>'dbl')::boolean;
  -- double in
  if not (st->'opened'->>si)::boolean then
    if dbl then st := jsonb_set(st, array['opened',si::text], 'true'); else h := jsonb_set(h,'{v}','0'); end if;
  end if;
  ns := sc - (h->>'v')::int;
  if ns < 0 or ns = 1 or (ns = 0 and not dbl) then bust := true; ns := vs; end if;
  won := (ns = 0 and not bust);
  vis := (st->'visit') || jsonb_build_array(h || jsonb_build_object('bust',bust,'x',round(p_x::numeric,1),'y',round(p_y::numeric,1)));
  st := jsonb_set(st, array['scores',si::text], to_jsonb(ns));
  st := jsonb_set(st, array['legDarts',si::text], to_jsonb((st->'legDarts'->>si)::int + 1));
  st := jsonb_set(st, '{v}', to_jsonb(p_seq));
  st := jsonb_set(st, '{last}', jsonb_build_object('key',p_key,'hit',h,'bust',bust,'won',won,'dart',dart));
  st := jsonb_set(st, '{visit}', vis);
  if won then
    legsArr := jsonb_set(st->'legs', array[si::text], to_jsonb((st->'legs'->>si)::int + 1));
    st := jsonb_set(st,'{legs}',legsArr);
    if (legsArr->>si)::int >= (st->>'need')::int then
      st := st || jsonb_build_object('done',true,'winner',si);
    else
      nt := jsonb_array_length(st->'scores');
      lg := ((st->>'legStarter')::int + 1) % np;
      st := st || jsonb_build_object('legStarter',lg,'cur',lg,'dart',1,'visit','[]'::jsonb,'leg',(st->>'leg')::int+1,
        'scores',(select jsonb_agg((st->>'start')::int) from generate_series(1,nt)),
        'legDarts',(select jsonb_agg(0) from generate_series(1,nt)),
        'opened',(select jsonb_agg(not (st->>'din')::boolean) from generate_series(1,nt)));
      si := case when (st->>'teams')::boolean then lg % 2 else lg end;
      st := jsonb_set(st,'{visitStart}',to_jsonb((st->>'start')::int));
    end if;
  elsif bust or dart >= 3 then
    -- next live player
    cur := (cur + 1) % np;
    for i in 1..np loop
      exit when not ((st->'left') ? (st->'players'->>cur));
      cur := (cur + 1) % np;
    end loop;
    si := case when (st->>'teams')::boolean then cur % 2 else cur end;
    st := st || jsonb_build_object('cur',cur,'dart',1,'visit','[]'::jsonb,'visitStart',(st->'scores'->>si)::int);
  else
    st := jsonb_set(st,'{dart}',to_jsonb(dart+1));
  end if;
  update tops_ref set state = st, updated_at = now(),
    log = case when jsonb_array_length(log) < 2000 then log || jsonb_build_array(jsonb_build_object('s',p_seq,'k',p_key,'x',round(p_x::numeric,1),'y',round(p_y::numeric,1),'bo',p_bo)) else log end
  where match_id = p_match;
  return st;
end $$;

create or replace function public.tops_ref_state(p_match text)
returns jsonb language sql stable security definer set search_path = public as $$
  select state from tops_ref where match_id = p_match $$;

-- a player left: skip their turns from now on
create or replace function public.tops_ref_leave(p_match text, p_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare st jsonb; np int; cur int;
begin
  select state into st from tops_ref where match_id = p_match for update;
  if st is null then return null; end if;
  if not ((st->'left') ? p_key) then st := jsonb_set(st,'{left}',(st->'left') || to_jsonb(p_key)); end if;
  np := jsonb_array_length(st->'players'); cur := (st->>'cur')::int;
  if st->'players'->>cur = p_key then
    for i in 1..np loop cur := (cur+1) % np; exit when not ((st->'left') ? (st->'players'->>cur)); end loop;
    st := st || jsonb_build_object('cur',cur,'dart',1,'visit','[]'::jsonb,'visitStart',(st->'scores'->>(case when (st->>'teams')::boolean then cur%2 else cur end))::int);
  end if;
  st := jsonb_set(st,'{v}',to_jsonb((st->>'v')::int + 1));
  update tops_ref set state = st, updated_at = now() where match_id = p_match;
  return st;
end $$;

revoke all on public.tops_ref from anon, authenticated;
grant execute on function public.tops_ref_start(text,text,jsonb), public.tops_ref_dart(text,text,int,double precision,double precision,boolean), public.tops_ref_state(text), public.tops_ref_leave(text,text) to anon, authenticated;
