-- Explicitly inserted user IDs can leave the serial sequence behind.
-- Block inserts while synchronizing, and never move the sequence backwards.
LOCK TABLE "users" IN SHARE ROW EXCLUSIVE MODE;
--> statement-breakpoint
SELECT setval(
  pg_get_serial_sequence('public.users', 'id'),
  GREATEST(
    COALESCE((SELECT MAX("id") FROM "users"), 1),
    (SELECT last_value FROM "users_id_seq")
  ),
  true
);
