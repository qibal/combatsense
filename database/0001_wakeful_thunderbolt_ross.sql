CREATE TABLE "rank" (
	"rank_id" serial PRIMARY KEY NOT NULL,
	"rank_name" varchar(50) NOT NULL,
	"rank_description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "rank_rank_name_unique" UNIQUE("rank_name")
);
--> statement-breakpoint
CREATE TABLE "unit" (
	"unit_id" serial PRIMARY KEY NOT NULL,
	"unit_name" varchar(100) NOT NULL,
	"unit_description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unit_unit_name_unique" UNIQUE("unit_name")
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "unit" TO "unit_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "rank" TO "rank_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_unit_id_unit_unit_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."unit"("unit_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_rank_id_rank_rank_id_fk" FOREIGN KEY ("rank_id") REFERENCES "public"."rank"("rank_id") ON DELETE no action ON UPDATE no action;