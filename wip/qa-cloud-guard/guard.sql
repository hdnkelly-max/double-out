-- PROPOSAL ONLY (not applied). Cloud save guard v2 for Season 3: compare-and-set on the save this device last synced.
-- Today's rule (kept for every call): refuse when the stored sv is higher, or equal from another device. It counts saves, so a device
-- that saved more often while it couldn't see another device's save wins (switch-on "stale write", FAIL on 4.26).
-- New, for clients that send p_base (the stored sv this device last loaded or pushed): refuse unless the stored sv is exactly p_base.
-- No same-device exemption (ChatGPT P1-1): two tabs or a copied device id share a dev. The check runs again inside the upsert
-- (ON CONFLICT ... WHERE), so it holds for a first save racing another first save too. Clients without p_base: today's rule exactly.
-- The reply has today's shape: {ok,sv} or {ok:false,err:'older',sv,data}.
begin;
drop function if exists public.tops_save3_put(jsonb);
create function public.tops_save3_put(p_data jsonb, p_base bigint default null)
 returns jsonb language plpgsql security definer set search_path = '' as $function$
-- security definer (ChatGPT P1-3): the only way a player writes a save. The owner is always auth.uid(), never anything in p_data.
declare uid uuid := auth.uid(); cur jsonb; nv bigint; cv bigint; n int;
begin
  if uid is null then return jsonb_build_object('ok',false,'err','signed out'); end if;
  select data into cur from public.tops_saves_s3 where user_id = uid for update;
  nv := coalesce((p_data->>'sv')::bigint, 0);
  cv := coalesce((cur->>'sv')::bigint, 0);
  if cur is not null and (
       (p_base is not null and cv <> p_base)                                                        -- new: someone saved since this device synced
    or cv > nv or (cv = nv and coalesce(cur->>'dev','') <> coalesce(p_data->>'dev','') and cv > 0)) then   -- today's rule
    return jsonb_build_object('ok',false,'err','older','sv',cv,'data',cur);
  end if;
  insert into public.tops_saves_s3(user_id,data,updated_at) values (uid,p_data,now())
    on conflict (user_id) do update set data = excluded.data, updated_at = now()
    where p_base is null or coalesce((tops_saves_s3.data->>'sv')::bigint, 0) = p_base;
  get diagnostics n = row_count;
  if n = 0 then   -- lost a race for the first save: the other device's row is there now
    select data into cur from public.tops_saves_s3 where user_id = uid;
    return jsonb_build_object('ok',false,'err','older','sv',coalesce((cur->>'sv')::bigint,0),'data',cur);
  end if;
  return jsonb_build_object('ok',true,'sv',nv);
end $function$;
revoke all on function public.tops_save3_put(jsonb, bigint) from public;
grant execute on function public.tops_save3_put(jsonb, bigint) to authenticated, service_role;   -- not anon (ChatGPT P2-2): a signed-out call gets a permission error, which the client already treats as a failed push
-- close the direct-write path (ChatGPT P1-3): players keep reading their own row; writes go through the function only.
-- The one client direct write (game4.js cloudPush's upsert) is replaced by v11's rpc push in every build since v1.56.
revoke insert, update, delete, truncate on public.tops_saves_s3 from anon, authenticated;
drop policy if exists tops_saves_s3_own_insert on public.tops_saves_s3;
drop policy if exists tops_saves_s3_own_update on public.tops_saves_s3;
notify pgrst, 'reload schema';
commit;
