ALTER TABLE "parents" ADD COLUMN "currency" text DEFAULT 'NOK' NOT NULL;
--> statement-breakpoint
UPDATE "parents" SET "currency" = CASE
  WHEN "locale" = 'sv-SE' THEN 'SEK'
  WHEN "locale" = 'da-DK' THEN 'DKK'
  ELSE 'NOK'
END;
--> statement-breakpoint
ALTER TABLE "parents" ADD CONSTRAINT "parents_currency_check" CHECK ("currency" IN ('NOK','SEK','DKK'));