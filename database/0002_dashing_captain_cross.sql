CREATE TABLE "session_commanders" (
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "session_commanders_session_id_user_id_pk" PRIMARY KEY("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "session_medics" (
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "session_medics_session_id_user_id_pk" PRIMARY KEY("session_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_location_id_training_locations_id_fk";
--> statement-breakpoint
ALTER TABLE "training_sessions" DROP CONSTRAINT "training_sessions_commander_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "training_sessions" ALTER COLUMN "status" SET DATA TYPE varchar(32);--> statement-breakpoint
ALTER TABLE "training_sessions" ALTER COLUMN "status" SET DEFAULT 'direncanakan';--> statement-breakpoint
ALTER TABLE "session_commanders" ADD CONSTRAINT "session_commanders_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_commanders" ADD CONSTRAINT "session_commanders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_medics" ADD CONSTRAINT "session_medics_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_medics" ADD CONSTRAINT "session_medics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" DROP COLUMN "commander_id";