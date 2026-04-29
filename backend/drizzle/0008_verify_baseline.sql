ALTER TABLE "pairing_codes" DROP CONSTRAINT "pairing_codes_target_kid_id_fkey";
--> statement-breakpoint
ALTER TABLE "parent_installs" DROP CONSTRAINT "parent_installs_parent_id_fkey";
--> statement-breakpoint
ALTER TABLE "kid_installs" DROP CONSTRAINT "kid_installs_kid_id_fkey";
--> statement-breakpoint
DROP INDEX "idx_completions_kid_date";--> statement-breakpoint
DROP INDEX "idx_pairing_expires";--> statement-breakpoint
DROP INDEX "idx_redemptions_kid_time";--> statement-breakpoint
DROP INDEX "idx_balance_kid_time";--> statement-breakpoint
DROP INDEX "idx_tasks_household_active";--> statement-breakpoint
DROP INDEX "idx_tasks_kid_active";--> statement-breakpoint
DROP INDEX "idx_rewards_household_active";--> statement-breakpoint
DROP INDEX "idx_household_invites_expires";--> statement-breakpoint
DROP INDEX "idx_household_invites_household";--> statement-breakpoint
DROP INDEX "idx_kids_household";--> statement-breakpoint
DROP INDEX "idx_parent_installs_install_id";--> statement-breakpoint
DROP INDEX "idx_parent_installs_last_seen";--> statement-breakpoint
DROP INDEX "idx_kid_installs_install_id";--> statement-breakpoint
DROP INDEX "idx_kid_installs_last_seen";--> statement-breakpoint
ALTER TABLE "pairing_codes" ADD CONSTRAINT "pairing_codes_target_kid_id_kids_id_fk" FOREIGN KEY ("target_kid_id") REFERENCES "public"."kids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_installs" ADD CONSTRAINT "parent_installs_parent_id_parents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."parents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kid_installs" ADD CONSTRAINT "kid_installs_kid_id_kids_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kids"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_completions_kid_date" ON "task_completions" USING btree ("kid_id","scheduled_for" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_pairing_expires" ON "pairing_codes" USING btree ("expires_at") WHERE "pairing_codes"."used_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_redemptions_kid_time" ON "reward_redemptions" USING btree ("kid_id","requested_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_balance_kid_time" ON "balance_entries" USING btree ("kid_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_tasks_household_active" ON "tasks" USING btree ("household_id","active") WHERE "tasks"."active" = true;--> statement-breakpoint
CREATE INDEX "idx_tasks_kid_active" ON "tasks" USING btree ("kid_id","active") WHERE "tasks"."active" = true;--> statement-breakpoint
CREATE INDEX "idx_rewards_household_active" ON "rewards" USING btree ("household_id","active");--> statement-breakpoint
CREATE INDEX "idx_household_invites_expires" ON "household_invites" USING btree ("expires_at") WHERE "household_invites"."used_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_household_invites_household" ON "household_invites" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_kids_household" ON "kids" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_parent_installs_install_id" ON "parent_installs" USING btree ("install_id");--> statement-breakpoint
CREATE INDEX "idx_parent_installs_last_seen" ON "parent_installs" USING btree ("last_seen_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_kid_installs_install_id" ON "kid_installs" USING btree ("install_id");--> statement-breakpoint
CREATE INDEX "idx_kid_installs_last_seen" ON "kid_installs" USING btree ("last_seen_at" DESC NULLS LAST);