import test from 'node:test';
import assert from 'node:assert/strict';

// Env bootstrap (DATABASE_URL → TEST_DATABASE_URL, placeholders) lives in
// src/tests/_env.ts. This suite is pure logic — no DB — so we don't call
// setupTestDb(); the import is here only to ensure config validation passes
// when sibling modules transitively pull config.ts.

const { lastDayOfMonth, isAllowancePayday, nextPaymentDate } = await import('../lib/time.js');

// 08:00 Europe/Oslo on the given calendar date — clear of DST cliffs and well
// inside the day in any tz nearby. The helpers operate in app tz so dates are
// constructed at noon UTC to stay on the right calendar day.
function osloNoon(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 10, 0, 0));
}

test('lastDayOfMonth — leap and non-leap February', () => {
  assert.equal(lastDayOfMonth(2024, 2), 29); // leap
  assert.equal(lastDayOfMonth(2025, 2), 28); // non-leap
  assert.equal(lastDayOfMonth(2025, 4), 30); // April
  assert.equal(lastDayOfMonth(2025, 12), 31); // December
});

test('isAllowancePayday — monthly day=31 in February clamps to last day (leap)', () => {
  // 2024 is leap → Feb 29 is the effective payday for day=31.
  assert.equal(
    isAllowancePayday(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 31, lastPaidAt: null },
      osloNoon(2024, 2, 29),
    ),
    true,
  );
  assert.equal(
    isAllowancePayday(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 31, lastPaidAt: null },
      osloNoon(2024, 2, 28),
    ),
    false,
  );
});

test('isAllowancePayday — monthly day=30 in non-leap February clamps to Feb 28', () => {
  assert.equal(
    isAllowancePayday(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 30, lastPaidAt: null },
      osloNoon(2025, 2, 28),
    ),
    true,
  );
});

test('isAllowancePayday — monthly day=31 in April fires on Apr 30', () => {
  assert.equal(
    isAllowancePayday(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 31, lastPaidAt: null },
      osloNoon(2025, 4, 30),
    ),
    true,
  );
  assert.equal(
    isAllowancePayday(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 31, lastPaidAt: null },
      osloNoon(2025, 4, 29),
    ),
    false,
  );
});

test('isAllowancePayday — biweekly requires 13+ days since lastPaidAt', () => {
  // 2025-05-05 is a Monday (dayOfWeek=1).
  const monday = osloNoon(2025, 5, 5);
  // 7 days ago — same dow, but only 7 days elapsed → not yet.
  const lastPaid = osloNoon(2025, 4, 28);
  assert.equal(
    isAllowancePayday(
      { frequency: 'biweekly', dayOfWeek: 1, dayOfMonth: null, lastPaidAt: lastPaid },
      monday,
    ),
    false,
  );
  // 14 days ago — clears the 13-day gate.
  const twoWeeksAgo = osloNoon(2025, 4, 21);
  assert.equal(
    isAllowancePayday(
      { frequency: 'biweekly', dayOfWeek: 1, dayOfMonth: null, lastPaidAt: twoWeeksAgo },
      monday,
    ),
    true,
  );
  // Never paid before — fires on the first matching dow.
  assert.equal(
    isAllowancePayday(
      { frequency: 'biweekly', dayOfWeek: 1, dayOfMonth: null, lastPaidAt: null },
      monday,
    ),
    true,
  );
});

test('nextPaymentDate — monthly rolls forward when today past this month payday', () => {
  // April 2025: day=15 has already passed by April 20 → roll to May 15.
  assert.equal(
    nextPaymentDate(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 15, lastPaidAt: null },
      osloNoon(2025, 4, 20),
    ),
    '2025-05-15',
  );
  // April 2025: day=31 → April 30.
  assert.equal(
    nextPaymentDate(
      { frequency: 'monthly', dayOfWeek: null, dayOfMonth: 31, lastPaidAt: null },
      osloNoon(2025, 4, 1),
    ),
    '2025-04-30',
  );
});

test('nextPaymentDate — none returns null', () => {
  assert.equal(
    nextPaymentDate(
      { frequency: 'none', dayOfWeek: null, dayOfMonth: null, lastPaidAt: null },
      osloNoon(2025, 5, 1),
    ),
    null,
  );
});
