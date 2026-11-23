-- PROPOSAL ONLY (not applied). Cloud save guard v3 for Season 3 (Producer 23 Nov 16:13, ChatGPT's R9 review): compare-and-set on the
-- save this device last synced, plus a permanent per-player "base_guarded" flag (legacy policy b).
-- 1. Clients that send p_base (the stored sv this device last loaded or pushed): refused unless the stored sv is exactly p_base.
--    No same-device exemption (two tabs or a copied device id share a dev). The check runs again inside the upsert (ON CONFLICT ... WHERE),
--    so it also holds for a first save racing another first save.
-- 2. Today's counter rule still applies to every call: refused when the stored sv is higher, or equal from another device.
-- 3. base_guarded: set on this player's first successful p_base write and never cleared by any save (only by an operator). Once set,
--    every p_data-only call (an old build, or any code path that forgot p_base) is refused with err 'upgrade_required', atomically
--    (under the row lock, and again in the upsert's WHERE for a racing first save). That reply carries no data, so an old client
--    (live 4.32's v11 adopts only err 'older' with data) changes nothing; a new client shows "reload to update".
-- Replies: {ok:true,sv} | {ok:false,err:'older',sv,data} | {ok:false,err:'upgrade_required',sv} | {ok:false,err:'signed out'}
begin;
alter table public.tops_saves_s3 add column if not exists base_guarded boolean not null default false;
drop function if exists public.tops_save3_put(jsonb);
drop function if exists public.tops_save3_put(jsonb, bigint);
create function public.tops_save3_put(p_data jsonb, p_base bigint default null)
 returns jsonb language plpgsql security definer set search_path = '' as $function$
-- security definer: the only way a player writes a save. The owner is always auth.uid(), never anything in p_data.
declare uid uuid := auth.uid(); cur jsonb; g boolean; nv bigint; cv bigint; n int;
begin
  if uid is null then return jsonb_build_object('ok',false,'err','signed out'); end if;
  select data, base_guarded into cur, g from public.tops_saves_s3 where user_id = uid for update;
  nv := coalesce((p_data->>'sv')::bigint, 0);
  cv := coalesce((cur->>'sv')::bigint, 0);
  if p_base is null and coalesce(g, false) then                                                  -- 3: this player has a new client
    return jsonb_build_object('ok',false,'err','upgrade_required','sv',cv);
  end if;
  if cur is not null and (
       (p_base is not null and cv <> p_base)                                                     -- 1: someone saved since this device synced
    or cv > nv or (cv = nv and coalesce(cur->>'dev','') <> coalesce(p_data->>'dev','') and cv > 0)) then   -- 2: today's rule
    return jsonb_build_object('ok',false,'err','older','sv',cv,'data',cur);
  end if;
  insert into public.tops_saves_s3(user_id,data,updated_at,base_guarded) values (uid,p_data,now(),p_base is not null)
    on conflict (user_id) do update set data = excluded.data, updated_at = now(),
      base_guarded = tops_saves_s3.base_guarded or excluded.base_guarded                         -- never cleared by a save
    where (p_base is not null and coalesce((tops_saves_s3.data->>'sv')::bigint, 0) = p_base)
       or (p_base is null and not tops_saves_s3.base_guarded                                     -- (Career's R10 version) a racing legacy first save
           and (coalesce((tops_saves_s3.data->>'sv')::bigint, 0) < nv                            -- also re-checks today's counter rule
             or (coalesce((tops_saves_s3.data->>'sv')::bigint, 0) = nv and coalesce(tops_saves_s3.data->>'dev','') = coalesce(p_data->>'dev',''))));
  get diagnostics n = row_count;
  if n = 0 then   -- lost a race for the first save: the other device's row is there now
    select data, base_guarded into cur, g from public.tops_saves_s3 where user_id = uid;
    if p_base is null and g then return jsonb_build_object('ok',false,'err','upgrade_required','sv',coalesce((cur->>'sv')::bigint,0)); end if;
    return jsonb_build_object('ok',false,'err','older','sv',coalesce((cur->>'sv')::bigint,0),'data',cur);
  end if;
  return jsonb_build_object('ok',true,'sv',nv);
end $function$;
revoke all on function public.tops_save3_put(jsonb, bigint) from public, anon, authenticated, service_role;   -- Supabase's default privileges grant EXECUTE on every new public function to anon, authenticated and service_role: take them all away, then grant back only these two
grant execute on function public.tops_save3_put(jsonb, bigint) to authenticated, service_role;   -- not anon: a signed-out call gets a permission error, which the client already treats as a failed push
-- close the direct-write path: players keep reading their own row; writes go through the function only (so the flag can't be cleared
-- by a direct UPDATE either). The one client direct write (game4.js cloudPush's upsert) is replaced by v11's rpc push in every build since v1.56.
revoke insert, update, delete, truncate on public.tops_saves_s3 from anon, authenticated;
drop policy if exists tops_saves_s3_own_insert on public.tops_saves_s3;
drop policy if exists tops_saves_s3_own_update on public.tops_saves_s3;
notify pgrst, 'reload schema';
commit;
