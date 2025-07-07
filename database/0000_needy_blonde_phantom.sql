CREATE TYPE "public"."session_status" AS ENUM('direncanakan', 'berlangsung', 'selesai', 'dibatalkan');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'komandan', 'medis', 'prajurit');--> statement-breakpoint
CREATE TABLE "live_monitoring_stats" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"heart_rate" integer,
	"speed_kph" real,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"checkup_date" date NOT NULL,
	"general_condition" text,
	"notes" text,
	"weight_kg" real,
	"height_cm" integer,
	"blood_pressure" varchar(50),
	"pulse" integer,
	"temperature" real,
	"other_diseases" text,
	"user_id" integer NOT NULL,
	"examiner_id" integer
);
--> statement-breakpoint
CREATE TABLE "ranks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	CONSTRAINT "ranks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "session_participants" (
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "session_participants_session_id_user_id_pk" PRIMARY KEY("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "training_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"map_image_url" text
);
--> statement-breakpoint
CREATE TABLE "training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "session_status" DEFAULT 'direncanakan' NOT NULL,
	"location_id" integer,
	"commander_id" integer
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	CONSTRAINT "units_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"avatar" text,
	"join_date" date,
	"height_cm" integer,
	"weight_kg" real,
	"rank_id" integer,
	"unit_id" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "live_monitoring_stats" ADD CONSTRAINT "live_monitoring_stats_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_monitoring_stats" ADD CONSTRAINT "live_monitoring_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_examiner_id_users_id_fk" FOREIGN KEY ("examiner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_session_id_training_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."training_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_location_id_training_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."training_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_commander_id_users_id_fk" FOREIGN KEY ("commander_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_rank_id_ranks_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."ranks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;