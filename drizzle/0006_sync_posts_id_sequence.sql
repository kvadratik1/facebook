-- Explicitly seeded post IDs do not advance the serial counter.
-- Keep this repair atomic and never move the counter backwards.
DO $$
BEGIN
  LOCK TABLE "posts" IN SHARE ROW EXCLUSIVE MODE;
  PERFORM setval(
    pg_get_serial_sequence('public.posts', 'id'),
    GREATEST(
      COALESCE((SELECT MAX("id") FROM "posts"), 1),
      (SELECT last_value FROM "posts_id_seq")
    ),
    true
  );
END
$$;
