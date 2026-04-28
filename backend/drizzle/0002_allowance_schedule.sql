-- Flexible allowance scheduling. Replaces single weekly_allowance_cents column
-- with a per-kid frequency + day(s) + last-paid-at, plus the kept-as-preference
-- amount.
ALTER TABLE "kids" ADD COLUMN "allowance_frequency" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "kids" ADD COLUMN "allowance_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "kids" ADD COLUMN "allowance_day_of_week" integer;--> statement-breakpoint
ALTER TABLE "kids" ADD COLUMN "allowance_day_of_month" integer;--> statement-breakpoint
ALTER TABLE "kids" ADD COLUMN "allowance_last_paid_at" timestamp with time zone;--> statement-breakpoint
-- Backfill: any kid with weekly_allowance_cents > 0 becomes weekly on Mondays.
-- dayOfWeek convention: 0 = Sunday … 6 = Saturday → Monday = 1.
UPDATE "kids"
   SET "allowance_frequency" = 'weekly',
       "allowance_cents" = "weekly_allowance_cents",
       "allowance_day_of_week" = 1
 WHERE "weekly_allowance_cents" > 0;--> statement-breakpoint
-- Drop the legacy column. v0 has no other consumers.
ALTER TABLE "kids" DROP COLUMN "weekly_allowance_cents";
