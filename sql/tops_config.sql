-- Kill switches (Process V2 §7): one read-only row the game reads at boot and at match boundaries (cfg.js).
-- Apply once (Shipping, under the Supabase lock). Players can read it; nobody can write it from the client.
create table if not exists public.tops_config(
  key text primary key,
  value jsonb not null default '{}'::jsonb check (jsonb_typeof(value)='object'),
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.tops_config enable row level security;
drop policy if exists tops_config_read on public.tops_config;
create policy tops_config_read on public.tops_config for select to anon, authenticated using (key = 'safe');
revoke insert, update, delete, truncate on public.tops_config from anon, authenticated;
grant select on public.tops_config to anon, authenticated;
insert into public.tops_config(key, value, updated_by) values ('safe', '{}'::jsonb, 'migration') on conflict (key) do nothing;

-- Flipping (Overseer or Shipping only, through the Supabase SQL tool). Phones pick it up at their next boot,
-- or at the next match start after a match ends / the app comes back (at most once a minute). Allowed keys:
--   crowd, venueFx, simpleFigures: true      profile: 'safe' (all three)      telemetry: 'minimal'
-- Anything else is ignored by the game. Examples:
--   update public.tops_config set value='{"profile":"safe"}', updated_at=now(), updated_by='overseer' where key='safe';
--   update public.tops_config set value='{"venueFx":true}',   updated_at=now(), updated_by='overseer' where key='safe';
--   update public.tops_config set value='{}',                 updated_at=now(), updated_by='overseer' where key='safe';  -- all off
