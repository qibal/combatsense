CREATE TYPE "public"."session_user_status" AS ENUM('ikut', 'luang');--> statement-breakpoint
ALTER TABLE "session_commanders" ALTER COLUMN "status" SET DEFAULT 'ikut'::"public"."session_user_status";--> statement-breakpoint
ALTER TABLE "session_commanders" ALTER COLUMN "status" SET DATA TYPE "public"."session_user_status" USING "status"::"public"."session_user_status";--> statement-breakpoint
ALTER TABLE "session_medics" ALTER COLUMN "status" SET DEFAULT 'ikut'::"public"."session_user_status";--> statement-breakpoint
ALTER TABLE "session_medics" ALTER COLUMN "status" SET DATA TYPE "public"."session_user_status" USING "status"::"public"."session_user_status";--> statement-breakpoint
ALTER TABLE "session_participants" ALTER COLUMN "status" SET DEFAULT 'ikut'::"public"."session_user_status";--> statement-breakpoint
ALTER TABLE "session_participants" ALTER COLUMN "status" SET DATA TYPE "public"."session_user_status" USING "status"::"public"."session_user_status";