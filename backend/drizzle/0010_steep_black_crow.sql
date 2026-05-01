CREATE TABLE "processed_webhook_events" (
	"provider" text NOT NULL,
	"event_id" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "processed_webhook_events_provider_event_id_pk" PRIMARY KEY("provider","event_id")
);
--> statement-breakpoint
ALTER TABLE "kids" ADD COLUMN "token_version" integer DEFAULT 0 NOT NULL;