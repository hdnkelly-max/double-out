-- PROPOSAL ONLY (not applied). Cloud save guard v3 for Season 3 (CAR-TABS R10; extends DQ's v2 on qa-cloud-guard).
-- v2, kept: compare-and-set on p_base (the stored sv this device last loaded or pushed): refused unless the stored sv is exactly p_base,
--   checked under the row lock and again inside the upsert (ON CONFLICT ... WHERE), so it holds for racing first saves too. Today's sv rule
--   (lower sv, or equal sv from another device) still applies on top. Direct writes closed; SECURITY DEFINER; EXECUTE for authenticated
--   and service_role only.
-- v3, new (ChatGPT legacy policy (b), Producer 16:13 Mon 23 Nov): a permanent per-player flag, base_guarded. The first successful write
--   that carries p_base sets it, and no save ever clears it (the column is written only here, only towards true; players can't write the
--   table directly). Once it is set, every write WITHOUT p_base (an old client: 4.32 and earlier) is refused atomically with
--   {ok:false, err:'upgrade_required', sv}. Before it is set, a write without p_base behaves exactly as today.
-- Replies: {ok:true,sv} | {ok:false,err:'older',sv,data} | {ok:false,err:'upgrade_required',sv} | {ok:false,err:'signed out'}.
begin;
alter table public.tops_saves_s3 add column if not exists base_guarded boolean not null default false;
drop function if exists public.tops_save3_put(jsonb);
create function public.tops_save3_put(p_data jsonb, p_base bigint default null)
 returns jsonb language plpgsql security definer set search_path = '' as $function$
-- security definer (ChatGPT P1-3): the only way a player writes a save. The owner is always auth.uid(), never anything in p_data.
declare uid uuid := auth.uid(); cur jsonb; g boolean; nv bigint; cv bigint; nd text; n int;
begin
  if uid is null then return jsonb_build_object('ok',false,'err','signed out'); end if;
  select data, base_guarded into cur, g from public.tops_saves_s3 where user_id = uid for update;
  nv := coalesce((p_data->>'sv')::bigint, 0);
  cv := coalesce((cur->>'sv')::bigint, 0);
  nd := coalesce(p_data->>'dev','');
  if p_base is null and coalesce(g, false) then                                                    -- v3: this player has a client that sends p_base
    return jsonb_build_object('ok',false,'err','upgrade_required','sv',cv);
  end if;
  if cur is not null and (
       (p_base is not null and cv <> p_base)                                                        -- someone saved since this device synced
    or cv > nv or (cv = nv and coalesce(cur->>'dev','') <> nd and cv > 0)) then                     -- today's rule
    return jsonb_build_object('ok',false,'err','older','sv',cv,'data',cur);
  end if;
  insert into public.tops_saves_s3(user_id,data,updated_at,base_guarded) values (uid,p_data,now(),p_base is not null)
    on conflict (user_id) do update set data = excluded.data, updated_at = now(),
      base_guarded = tops_saves_s3.base_guarded or excluded.base_guarded                            -- only ever towards true
    where (p_base is not null and coalesce((tops_saves_s3.data->>'sv')::bigint, 0) = p_base)
       or (p_base is null and not tops_saves_s3.base_guarded                                        -- a racing first save: the same rules again
           and (coalesce((tops_saves_s3.data->>'sv')::bigint, 0) < nv
             or (coalesce((tops_saves_s3.data->>'sv')::bigint, 0) = nv and coalesce(tops_saves_s3.data->>'dev','') = nd)));
  get diagnostics n = row_count;
  if n = 0 then   -- lost a race for the first save: the other device's row is there now
    select data, base_guarded into cur, g from public.tops_saves_s3 where user_id = uid;
    if p_base is null and g then return jsonb_build_object('ok',false,'err','upgrade_required','sv',coalesce((cur->>'sv')::bigint,0)); end if;
    return jsonb_build_object('ok',false,'err','older','sv',coalesce((cur->>'sv')::bigint,0),'data',cur);
  end if;
  return jsonb_build_object('ok',true,'sv',nv);
end $function$;
revoke all on function public.tops_save3_put(jsonb, bigint) from public, anon, authenticated, service_role;   -- Supabase's default privileges grant EXECUTE on every new public function to anon, authenticated and service_role: take them all away, then grant back only these two
grant execute on function public.tops_save3_put(jsonb, bigint) to authenticated, service_role;   -- not anon (ChatGPT P2-2): a signed-out call gets a permission error, which the client already treats as a failed push
-- close the direct-write path (ChatGPT P1-3): players keep reading their own row; writes go through the function only (so nobody can clear base_guarded).
revoke insert, update, delete, truncate on public.tops_saves_s3 from anon, authenticated;
drop policy if exists tops_saves_s3_own_insert on public.tops_saves_s3;
drop policy if exists tops_saves_s3_own_update on public.tops_saves_s3;
notify pgrst, 'reload schema';
commit;
