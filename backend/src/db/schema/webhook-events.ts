import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// Idempotency log for webhook deliveries. Keyed on (provider, event_id);
// the first DB write wins, retries see ON CONFLICT DO NOTHING and bail
// out at the route boundary so we never re-apply a side effect (welcome
// email, balance change, subscription flip).
export const processedWebhookEvents = pgTable(
  'processed_webhook_events',
  {
    provider: text().notNull(),
    eventId: text().notNull(),
    processedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.eventId] })],
);

export type ProcessedWebhookEventRow = typeof processedWebhookEvents.$inferSelect;
