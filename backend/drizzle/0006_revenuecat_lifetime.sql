-- Lifetime IAP grants the `Kroni Family` entitlement permanently — no
-- expiration date. Tracked separately from the recurring sub so a
-- lifetime owner survives a future tier rename and is never gated by
-- subscription_expires_at.
ALTER TABLE "households"
  ADD COLUMN "lifetime_paid" boolean NOT NULL DEFAULT false;
