-- Convert IDs atomically while preserving every existing post-to-user link.
-- The guard allows this repair to run separately when older migrations are blocked.
DO $$
BEGIN
  LOCK TABLE "users", "posts" IN ACCESS EXCLUSIVE MODE;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    RETURN;
  END IF;

  ALTER TABLE "users" ADD COLUMN "migration_uuid" uuid NOT NULL DEFAULT gen_random_uuid();
  ALTER TABLE "posts" ADD COLUMN "migration_user_uuid" uuid;

  UPDATE "posts" AS p
  SET "migration_user_uuid" = u."migration_uuid"
  FROM "users" AS u
  WHERE p."user_id" = u."id";

  IF EXISTS (
    SELECT 1 FROM "posts"
    WHERE "user_id" IS NOT NULL AND "migration_user_uuid" IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot convert user IDs: a post references a missing user';
  END IF;

  ALTER TABLE "posts" DROP CONSTRAINT "posts_user_id_users_id_fk";
  ALTER TABLE "users" ALTER COLUMN "id" DROP DEFAULT;
  ALTER TABLE "users" ALTER COLUMN "id" TYPE uuid USING "migration_uuid";
  ALTER TABLE "users" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
  ALTER TABLE "posts" ALTER COLUMN "user_id" TYPE uuid USING "migration_user_uuid";

  ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION;

  ALTER TABLE "posts" DROP COLUMN "migration_user_uuid";
  ALTER TABLE "users" DROP COLUMN "migration_uuid";
  DROP SEQUENCE "users_id_seq";
END
$$;
