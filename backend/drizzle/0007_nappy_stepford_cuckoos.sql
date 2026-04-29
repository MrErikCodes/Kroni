-- Adds parent_devices for Expo push token registration. Mirrors kid_devices.
-- Used by the RevenueCat webhook to push billing-issue / expiration events
-- to the household's premium-owner parent.
--
-- Note: drizzle-kit auto-diff also generated CREATE/ALTER statements for
-- tables and columns that ALREADY exist in the DB (parent_installs,
-- kid_installs, balance_entries.reference_title, households.lifetime_paid,
-- kids.allowance_*, pairing_codes.target_kid_id, kid_devices indexes, FKs)
-- because the snapshot baseline (drizzle/meta/) is out of sync with the
-- legacy hand-written migrations 0002–0006. Those statements were stripped
-- here. The snapshot baseline rebuild is tracked in todo.md.
CREATE TABLE "parent_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid NOT NULL,
	"device_id" text NOT NULL,
	"push_token" text,
	"platform" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_parent_device" UNIQUE("parent_id","device_id")
);
--> statement-breakpoint
ALTER TABLE "parent_devices" ADD CONSTRAINT "parent_devices_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;
