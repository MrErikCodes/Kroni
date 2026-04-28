CREATE TABLE "household_invites" (
	"code" char(6) PRIMARY KEY NOT NULL,
	"household_id" uuid NOT NULL,
	"invited_email" text,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"used_by_parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"subscription_tier" text DEFAULT 'free' NOT NULL,
	"subscription_expires_at" timestamp with time zone,
	"premium_owner_parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kids" DROP CONSTRAINT "kids_parent_id_parents_id_fk";
--> statement-breakpoint
ALTER TABLE "pairing_codes" DROP CONSTRAINT "pairing_codes_parent_id_parents_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_parent_id_parents_id_fk";
--> statement-breakpoint
ALTER TABLE "rewards" DROP CONSTRAINT "rewards_parent_id_parents_id_fk";
--> statement-breakpoint
DROP INDEX "idx_kids_parent";--> statement-breakpoint
DROP INDEX "idx_rewards_parent_active";--> statement-breakpoint
ALTER TABLE "kids" ALTER COLUMN "parent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pairing_codes" ALTER COLUMN "parent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "parent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "parent_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "parents" ADD COLUMN "household_id" uuid;--> statement-breakpoint
-- household_id columns added nullable initially so the backfill below can populate
-- them in-place. Final NOT NULL enforcement is appended after the backfill.
ALTER TABLE "kids" ADD COLUMN "household_id" uuid;--> statement-breakpoint
ALTER TABLE "pairing_codes" ADD COLUMN "household_id" uuid;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "household_id" uuid;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "household_id" uuid;--> statement-breakpoint
ALTER TABLE "household_invites" ADD CONSTRAINT "household_invites_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_invites" ADD CONSTRAINT "household_invites_created_by_parents_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household_invites" ADD CONSTRAINT "household_invites_used_by_parent_id_parents_id_fk" FOREIGN KEY ("used_by_parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_household_invites_expires" ON "household_invites" USING btree ("expires_at") WHERE "household_invites"."used_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_household_invites_household" ON "household_invites" USING btree ("household_id");--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids" ADD CONSTRAINT "kids_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids" ADD CONSTRAINT "kids_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_kids_household" ON "kids" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_household_active" ON "tasks" USING btree ("household_id","active") WHERE "tasks"."active" = true;--> statement-breakpoint
CREATE INDEX "idx_rewards_household_active" ON "rewards" USING btree ("household_id","active");--> statement-breakpoint
-- Backfill: every existing parent gets a household; kids/tasks/rewards/pairing_codes
-- assigned by parent_id. Premium owner is set to the existing parent so RC keying
-- has somewhere to land. The parent's denormalized subscription fields are copied
-- into the new household and remain on parents as a cache.
DO $$
DECLARE p RECORD;
DECLARE new_household_id uuid;
BEGIN
  FOR p IN SELECT id, subscription_tier, subscription_expires_at FROM parents WHERE household_id IS NULL LOOP
    INSERT INTO households (subscription_tier, subscription_expires_at, premium_owner_parent_id)
      VALUES (p.subscription_tier, p.subscription_expires_at, p.id)
      RETURNING id INTO new_household_id;
    UPDATE parents SET household_id = new_household_id WHERE id = p.id;
    UPDATE kids SET household_id = new_household_id WHERE parent_id = p.id;
    UPDATE tasks SET household_id = new_household_id WHERE parent_id = p.id;
    UPDATE rewards SET household_id = new_household_id WHERE parent_id = p.id;
    UPDATE pairing_codes SET household_id = new_household_id WHERE parent_id = p.id;
  END LOOP;
END $$;
--> statement-breakpoint
-- Now enforce NOT NULL on the populated household_id columns. Parents stays
-- nullable so a freshly-created parent (Clerk webhook) can briefly exist
-- before ensureHouseholdForParent runs.
ALTER TABLE "kids" ALTER COLUMN "household_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "household_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ALTER COLUMN "household_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pairing_codes" ALTER COLUMN "household_id" SET NOT NULL;
