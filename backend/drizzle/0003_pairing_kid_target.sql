-- Pairing codes are now tied to a specific pre-created kid. The kid's name
-- and avatar are set by the parent before issuing the code, so the public
-- pair endpoint only attaches a device.
--
-- Any in-flight codes from the previous flow are no longer redeemable; drop
-- them rather than back-fill with a guess. Production has no live users yet.
DELETE FROM "pairing_codes";--> statement-breakpoint
ALTER TABLE "pairing_codes"
  ADD COLUMN "target_kid_id" uuid NOT NULL
  REFERENCES "kids"("id") ON DELETE CASCADE;
