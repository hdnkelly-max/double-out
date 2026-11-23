-- POST-APPLY CHECK (run right after guard.sql). Safe on production: it ends by raising an error on purpose, so the whole check is
-- rolled back and nothing it wrote stays (the error message IS the result). Uses a made-up player id that has no save.
do $$
declare r text := ''; u uuid := '00000000-0000-4000-8000-0000000c10d0'; x jsonb;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  x := public.tops_save3_put('{"sv":5,"dev":"A","qa":1}'::jsonb);                r := r || 'first save (p_data only):' || (x->>'ok');
  x := public.tops_save3_put('{"sv":6,"dev":"A","qa":1}'::jsonb);                r := r || ' | old client before the flag:' || (x->>'ok');
  x := public.tops_save3_put('{"sv":7,"dev":"B","qa":1}'::jsonb, 6);             r := r || ' | new client, current base:' || (x->>'ok');
  x := public.tops_save3_put('{"sv":8,"dev":"A","qa":1}'::jsonb);                r := r || ' | old client after the flag:' || coalesce(x->>'err', 'ok=' || (x->>'ok'));
  x := public.tops_save3_put('{"sv":99,"dev":"A","qa":1}'::jsonb, 6);            r := r || ' | stale base:' || coalesce(x->>'err', 'ok=' || (x->>'ok')) || ' sv ' || (x->>'sv');
  x := public.tops_save3_put('{"sv":8,"dev":"B","qa":1}'::jsonb, 7);             r := r || ' | new client again:' || (x->>'ok');
  begin update public.tops_saves_s3 set base_guarded = false where user_id = u; r := r || ' | direct update ALLOWED (bad)';
  exception when insufficient_privilege then r := r || ' | direct update refused'; end;
  raise exception 'QA-CHECK (rolled back): %', r;
end $$;
-- EXPECTED: first save (p_data only):true | old client before the flag:true | new client, current base:true | old client after the flag:upgrade_required | stale base:older sv 7 | new client again:true | direct update refused
