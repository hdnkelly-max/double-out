-- Rollback: today's function exactly as it is on 22 Nov (pg_get_functiondef), today's grants, today's table grants and write policies.
-- The base_guarded column (guard v3) is LEFT in place on purpose: today's function never reads or writes it, its default keeps inserts
-- working, and keeping it means a later re-apply still knows which players already have a new client. To remove it as well (only if the
-- guard is abandoned for good), run after this file: alter table public.tops_saves_s3 drop column if exists base_guarded;
begin;
drop function if exists public.tops_save3_put(jsonb, bigint);
CREATE FUNCTION public.tops_save3_put(p_data jsonb)
 RETURNS jsonb LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
declare uid uuid := auth.uid(); cur jsonb; nv bigint; cv bigint;
begin
  if uid is null then return jsonb_build_object('ok',false,'err','signed out'); end if;
  select data into cur from tops_saves_s3 where user_id = uid for update;
  nv := coalesce((p_data->>'sv')::bigint, 0);
  cv := coalesce((cur->>'sv')::bigint, 0);
  if cur is not null and (cv > nv or (cv = nv and coalesce(cur->>'dev','') <> coalesce(p_data->>'dev','') and cv > 0)) then
    return jsonb_build_object('ok',false,'err','older','sv',cv,'data',cur);
  end if;
  insert into tops_saves_s3(user_id,data,updated_at) values (uid,p_data,now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now();
  return jsonb_build_object('ok',true,'sv',nv);
end $function$;
grant execute on function public.tops_save3_put(jsonb) to public, anon, authenticated, service_role;
grant insert, update, delete, truncate on public.tops_saves_s3 to anon, authenticated;
drop policy if exists tops_saves_s3_own_insert on public.tops_saves_s3; create policy tops_saves_s3_own_insert on public.tops_saves_s3 for insert with check (auth.uid() = user_id);
drop policy if exists tops_saves_s3_own_update on public.tops_saves_s3; create policy tops_saves_s3_own_update on public.tops_saves_s3 for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
notify pgrst, 'reload schema';
commit;
