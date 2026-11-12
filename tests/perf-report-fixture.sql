-- CAR-4 test fixture: fake tops_perf rows with known answers for sql/reports/*.sql (local scratch Postgres only).
-- Hayden: session A (3 h ago) = match 1 smooth (a 30 s row AND an end row: the end row must win), match 2 worse,
--         match 3 only a 30 s checkpoint (interrupted); session B (1 h ago) = one match (match_index starts at 1 again).
-- Excluded: Lee's row (other player) and a Hayden row 30 h ago (outside the 24 h window).
create table if not exists public.tops_saves(user_id uuid primary key, data jsonb, updated_at timestamptz default now());
truncate public.tops_perf; delete from public.tops_saves;
insert into auth.users(id) values ('11111111-1111-1111-1111-111111111111'), ('22222222-2222-2222-2222-222222222222') on conflict do nothing;  -- tops_perf.user_id references auth.users
insert into public.tops_saves(user_id, data) values
  ('11111111-1111-1111-1111-111111111111', '{"name":"Hayden"}'),
  ('22222222-2222-2222-2222-222222222222', '{"name":"Lee"}');
insert into public.tops_perf(sample_id, match_id, user_id, at, ver, phase, status, mode, tier, secs, frame_n,
  fps, p50, p95, p99, stalls100, max_ms, reticle_p50, reticle_p95, reticle_max, draws_max, tris_max, heap_mb,
  match_index, app_secs, geometries, textures, programs, frame_hist, standalone, audio_issue_n, dev)
values
-- session A, match 1: 30 s checkpoint (should be ignored: the end row exists) and the end row
('a1-30', 'mA1', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours' + interval '30 seconds', '2.09', '30s', 'partial', 'career', '1', 30, 1800,
  60, 16.7, 20, 30, 0, 40, 18, 25, 40, 150, 200000, null, 1, 5, 120, 45, 22, '{0,0,1700,80,20,0,0,0,0,0}', true, 0, '{"device_class":"iOS-3x-390"}'),
('a1-end', 'mA1', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours' + interval '8 minutes', '2.09', 'end', 'complete', 'career', '1', 480, 28000,
  59, 16.7, 18, 28, 0, 60, 17, 20, 45, 152, 201000, null, 1, 5, 121, 45, 22, '{0,0,26000,1500,400,100,0,0,0,0}', true, 0, '{"device_class":"iOS-3x-390"}'),
-- session A, match 2: worse (p95 45, reticle 60, 10 % of frames over 33 ms)
('a2-end', 'mA2', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours' + interval '18 minutes', '2.09', 'end', 'complete', 'career', '1', 540, 20000,
  41, 22, 45, 70, 6, 240, 30, 60, 140, 160, 210000, null, 2, 500, 180, 60, 23, '{0,0,10000,3000,3000,2000,1500,400,80,20}', true, 1, '{"device_class":"iOS-3x-390"}'),
-- session A, match 3: only a 30 s checkpoint (app closed mid-match)
('a3-30', 'mA3', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours' + interval '20 minutes', '2.09', '30s', 'partial', 'career', '1', 60, 2400,
  40, 23, 50, 80, 2, 180, 32, 64, 120, 162, 211000, null, 3, 1100, 190, 62, 23, '{0,0,1000,500,400,250,200,40,8,2}', true, 0, '{"device_class":"iOS-3x-390"}'),
-- session B (app reopened): match_index 1 again
('b1-end', 'mB1', '11111111-1111-1111-1111-111111111111', now() - interval '1 hour', '2.09', 'end', 'complete', 'career', '1', 400, 24000,
  60, 16.7, 19, 27, 0, 50, 17, 21, 40, 150, 200000, null, 1, 6, 120, 45, 22, '{0,0,23000,800,200,0,0,0,0,0}', true, 0, '{"device_class":"iOS-3x-390"}'),
-- excluded: another player, and Hayden 30 h ago
('lee-end', 'mL1', '22222222-2222-2222-2222-222222222222', now() - interval '2 hours', '2.09', 'end', 'complete', 'career', '2', 400, 24000,
  60, 16.7, 17, 20, 0, 30, 16, 18, 30, 140, 190000, null, 1, 10, 110, 44, 21, '{0,0,24000,0,0,0,0,0,0,0}', false, 0, '{"device_class":"Android-3x-412"}'),
('old-end', 'mOld', '11111111-1111-1111-1111-111111111111', now() - interval '30 hours', '2.07', 'end', 'complete', 'career', '1', 400, 24000,
  30, 33, 90, 150, 20, 900, 60, 120, 300, 200, 250000, null, 1, 5, 300, 90, 30, '{0,0,0,0,0,10000,10000,3000,800,200}', true, 5, '{"device_class":"iOS-3x-390"}');
