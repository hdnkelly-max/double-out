-- POST-APPLY CHECK for guard v3 (run right after guard.sql). Safe on production: it ends by raising an error on purpose, so the whole check is
-- rolled back and nothing it wrote stays (the error message IS the result). Uses a made-up player id that has no save.
do $$
declare r text := ''; u uuid := '00000000-0000-4000-8000-0000000c10d0'; x jsonb;
begin
  perform set_config('request.jwt.claims', json_build_object('sub', u, 'role', 'authenticated')::text, true);
  set local role authenticated;
  x := public.tops_save3_put('{"sv":5,"dev":"A","qa":1}'::jsonb);                r := r || 'first save (p_data only):' || (x->>'ok');
  x := public.tops_save3_put('{"sv":6,"dev":"A","qa":1}'::jsonb);                r := r || ' | old client, p_data only:' || (x->>'ok');
  x := public.tops_save3_put('{"sv":7,"dev":"B","qa":1}'::jsonb, 6);             r := r || ' | new client, current base:' || (x->>'ok');
  x := public.tops_save3_put('{"sv":99,"dev":"A","qa":1}'::jsonb, 6);            r := r || ' | stale base:' || coalesce(x->>'err', 'ok=' || (x->>'ok')) || ' sv ' || (x->>'sv');
  x := public.tops_save3_put('{"sv":100,"dev":"A","qa":1}'::jsonb);              r := r || ' | old client after the flag:' || coalesce(x->>'err', 'ok=' || (x->>'ok'));
  r := r || ' | flag:' || (select base_guarded::text from public.tops_saves_s3 where user_id = u);
  begin update public.tops_saves_s3 set updated_at = now() where user_id = u; r := r || ' | direct update ALLOWED (bad)';
  exception when insufficient_privilege then r := r || ' | direct update refused'; end;
  raise exception 'QA-CHECK (rolled back): %', r;
end $$;
-- EXPECTED: first save (p_data only):true | old client, p_data only:true | new client, current base:true | stale base:older sv 7 | old client after the flag:upgrade_required | flag:true | direct update refused
