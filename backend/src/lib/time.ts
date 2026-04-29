import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfWeek } from 'date-fns';

const APP_TZ = 'Europe/Oslo';
const tz = (): string => APP_TZ;

// Returns YYYY-MM-DD string in app timezone (Europe/Oslo).
export function todayInAppTz(now: Date = new Date()): string {
  return formatInTimeZone(now, tz(), 'yyyy-MM-dd');
}

export function nowInAppTz(now: Date = new Date()): Date {
  return toZonedTime(now, tz());
}

export function dayOfWeekInAppTz(now: Date = new Date()): number {
  // 0 = Sunday … 6 = Saturday (matches JS Date.getDay convention).
  return Number(formatInTimeZone(now, tz(), 'i')) % 7;
}

export function dayOfMonthInAppTz(now: Date = new Date()): number {
  return Number(formatInTimeZone(now, tz(), 'd'));
}

export function monthInAppTz(now: Date = new Date()): number {
  // 1 = Jan … 12 = Dec.
  return Number(formatInTimeZone(now, tz(), 'M'));
}

export function yearInAppTz(now: Date = new Date()): number {
  return Number(formatInTimeZone(now, tz(), 'yyyy'));
}

export function startOfWeekInAppTz(now: Date = new Date()): Date {
  // ISO week starts Monday in Norway.
  return startOfWeek(toZonedTime(now, tz()), { weekStartsOn: 1 });
}

export function isoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

// Last calendar day of the given month/year. Pure — no tz needed.
export function lastDayOfMonth(year: number, month: number): number {
  // month is 1-indexed. JS Date with day 0 of next month is the last day of
  // the current month.
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Whether today (in app tz) is a payday for a kid with the given allowance
// schedule. Pure with respect to the `now` param so it can be unit-tested.
export interface AllowancePaydayInput {
  frequency: 'none' | 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  lastPaidAt: Date | null;
}

export function isAllowancePayday(
  input: AllowancePaydayInput,
  now: Date = new Date(),
): boolean {
  if (input.frequency === 'none') return false;
  if (input.frequency === 'weekly') {
    if (input.dayOfWeek === null) return false;
    return dayOfWeekInAppTz(now) === input.dayOfWeek;
  }
  if (input.frequency === 'biweekly') {
    if (input.dayOfWeek === null) return false;
    if (dayOfWeekInAppTz(now) !== input.dayOfWeek) return false;
    if (input.lastPaidAt === null) return true;
    const elapsedMs = now.getTime() - input.lastPaidAt.getTime();
    const thirteenDaysMs = 13 * 24 * 60 * 60 * 1000;
    return elapsedMs >= thirteenDaysMs;
  }
  // monthly
  if (input.dayOfMonth === null) return false;
  const y = yearInAppTz(now);
  const m = monthInAppTz(now);
  const last = lastDayOfMonth(y, m);
  const target = Math.min(input.dayOfMonth, last);
  return dayOfMonthInAppTz(now) === target;
}

// True when `lastPaidAt`'s app-tz date is the same calendar day as today.
// Used to short-circuit duplicate-pay attempts when the daily cron retries.
export function paidAlreadyToday(
  lastPaidAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!lastPaidAt) return false;
  return todayInAppTz(lastPaidAt) === todayInAppTz(now);
}

// ISO date (YYYY-MM-DD) string for the next scheduled payment, given a kid's
// schedule. Returns null when frequency is 'none' or the schedule is
// inconsistent. Used by mobile to render "Neste utbetaling: …".
export function nextPaymentDate(
  input: AllowancePaydayInput,
  now: Date = new Date(),
): string | null {
  if (input.frequency === 'none') return null;
  if (input.frequency === 'weekly') {
    if (input.dayOfWeek === null) return null;
    return addDaysIso(now, daysUntilDayOfWeek(now, input.dayOfWeek, true));
  }
  if (input.frequency === 'biweekly') {
    if (input.dayOfWeek === null) return null;
    // If we already paid recently, the next slot is two weeks after lastPaidAt.
    if (input.lastPaidAt) {
      const next = new Date(input.lastPaidAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      // Only honor the 14-day-from-last anchor if it lies in the future.
      if (next.getTime() > now.getTime()) {
        return todayInAppTz(next);
      }
    }
    return addDaysIso(now, daysUntilDayOfWeek(now, input.dayOfWeek, true));
  }
  // monthly
  if (input.dayOfMonth === null) return null;
  const y = yearInAppTz(now);
  const m = monthInAppTz(now);
  const todayDom = dayOfMonthInAppTz(now);
  const thisMonthLast = lastDayOfMonth(y, m);
  const thisMonthTarget = Math.min(input.dayOfMonth, thisMonthLast);
  if (todayDom <= thisMonthTarget) {
    return `${y}-${String(m).padStart(2, '0')}-${String(thisMonthTarget).padStart(2, '0')}`;
  }
  // Past this month's payday — roll to next month.
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const nextLast = lastDayOfMonth(nextYear, nextMonth);
  const nextTarget = Math.min(input.dayOfMonth, nextLast);
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(nextTarget).padStart(2, '0')}`;
}

function daysUntilDayOfWeek(
  now: Date,
  targetDow: number,
  includeToday: boolean,
): number {
  const today = dayOfWeekInAppTz(now);
  if (includeToday && today === targetDow) return 0;
  const diff = (targetDow - today + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function addDaysIso(now: Date, days: number): string {
  const next = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return todayInAppTz(next);
}
