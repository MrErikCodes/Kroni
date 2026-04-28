-- One row per (parent, install) and per (kid, install). Upserted on every
-- authenticated request so `last_seen_at` doubles as activity tracking.
-- Lets support join from the install_id pasted via "Kopier app info" back
-- to recent server-side state, and (once Sentry is wired) to crashes
-- tagged with the same id.
CREATE TABLE IF NOT EXISTS "parent_installs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_id" uuid NOT NULL REFERENCES "parents"("id") ON DELETE CASCADE,
  "install_id" text NOT NULL,
  "platform" text,
  "app_version" text,
  "app_build" text,
  "os_version" text,
  "last_seen_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "uq_parent_installs" UNIQUE ("parent_id", "install_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parent_installs_install_id"
  ON "parent_installs" ("install_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_parent_installs_last_seen"
  ON "parent_installs" ("last_seen_at" DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kid_installs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kid_id" uuid NOT NULL REFERENCES "kids"("id") ON DELETE CASCADE,
  "install_id" text NOT NULL,
  "platform" text,
  "app_version" text,
  "app_build" text,
  "os_version" text,
  "last_seen_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "uq_kid_installs" UNIQUE ("kid_id", "install_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kid_installs_install_id"
  ON "kid_installs" ("install_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_kid_installs_last_seen"
  ON "kid_installs" ("last_seen_at" DESC);
