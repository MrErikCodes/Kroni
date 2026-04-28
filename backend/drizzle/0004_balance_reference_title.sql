-- Snapshot the underlying task / reward title onto each balance entry at
-- write time. Lets the kid + parent history screens show "Rydde rommet"
-- instead of "Oppgave fullført", and survives later deletion of the source
-- task or reward (which used to leave the entry only labelled by reason).
ALTER TABLE "balance_entries" ADD COLUMN "reference_title" text;--> statement-breakpoint
-- Backfill existing rows by looking up the source entity. We don't try to
-- be clever about deleted rows — they just stay null.
UPDATE "balance_entries" be
   SET "reference_title" = t.title
  FROM "tasks" t, "task_completions" tc
 WHERE be.reason = 'task'
   AND be.reference_id = tc.id
   AND tc.task_id = t.id
   AND be.reference_title IS NULL;--> statement-breakpoint
UPDATE "balance_entries" be
   SET "reference_title" = r.title
  FROM "rewards" r, "reward_redemptions" rr
 WHERE be.reason = 'redemption'
   AND be.reference_id = rr.id
   AND rr.reward_id = r.id
   AND be.reference_title IS NULL;
