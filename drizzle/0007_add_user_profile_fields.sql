ALTER TABLE "users" ADD COLUMN "bio" varchar(160);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_public_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cover_image_public_id" text;