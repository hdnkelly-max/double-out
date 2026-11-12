-- CAR-5c (optional, needs Hayden's OK): put the per-dart release record on tops_darts itself.
-- Not needed to answer the "far green" question: from 3.28 every dart's record is in the flight recorder (tops_log 'match_dart' events).
-- This column only makes it queryable straight from tops_darts. Order: apply this first, then a one-line release sets
-- window.TOPS_DARTS_REL = true (until then the client never sends 'rel', so inserts can't fail on a missing column).
-- Additive and nullable: existing rows and older clients are unaffected; rollback = drop the column.
alter table public.tops_darts add column if not exists rel jsonb;
alter table public.tops_darts drop constraint if exists tops_darts_rel_size;
alter table public.tops_darts add constraint tops_darts_rel_size check (rel is null or (jsonb_typeof(rel) = 'object' and pg_column_size(rel) < 1024));
-- grants and RLS are unchanged: the column inherits the table's insert-only policy for the signed-in player's own rows.
