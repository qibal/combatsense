ALTER TABLE "session_commanders" ADD COLUMN "status" varchar(32) DEFAULT 'aktif' NOT NULL;--> statement-breakpoint
ALTER TABLE "session_medics" ADD COLUMN "status" varchar(32) DEFAULT 'aktif' NOT NULL;--> statement-breakpoint
ALTER TABLE "session_participants" ADD COLUMN "status" varchar(32) DEFAULT 'aktif' NOT NULL;