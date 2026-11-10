-- Versioned cloud saves: a write only lands if it is newer than what the cloud holds.
-- save.sv counts up on every local save; save.dev names the device that wrote it.
create or replace function public.tops_save_put(p_data jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare uid uuid := auth.uid(); cur jsonb; nv bigint; cv bigint;
begin
  if uid is null then return jsonb_build_object('ok',false,'err','signed out'); end if;
  select data into cur from tops_saves where user_id = uid for update;
  nv := coalesce((p_data->>'sv')::bigint, 0);
  cv := coalesce((cur->>'sv')::bigint, 0);
  if cur is not null and (cv > nv or (cv = nv and coalesce(cur->>'dev','') <> coalesce(p_data->>'dev','') and cv > 0)) then
    return jsonb_build_object('ok',false,'err','older','sv',cv,'data',cur);
  end if;
  insert into tops_saves(user_id,data,updated_at) values (uid,p_data,now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now();
  return jsonb_build_object('ok',true,'sv',nv);
end $$;
revoke all on function public.tops_save_put(jsonb) from public, anon;
grant execute on function public.tops_save_put(jsonb) to authenticated;
