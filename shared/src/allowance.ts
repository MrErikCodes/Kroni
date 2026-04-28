// Pure allowance scheduling helpers. Shared between backend (cron + tests) and
// mobile (UI display). No tz library — operations use either UTC or the
// local-tz JS Date as appropriate, since both consumers already format dates
// in their own locale layers.
import type { AllowanceFrequency } from './schemas/kid.js';

export interface AllowanceSchedule {
  frequency: AllowanceFrequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  lastPaidAt: Date | null;
}

// Last calendar day of the given month/year. month is 1-indexed.
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// Next payment as YYYY-MM-DD, or null when frequency is 'none' or schedule
// is missing required day fields. The implementation stays in the local-tz
// JS Date world and mirrors what the backend cron computes — close enough
// for UI display ("Neste utbetaling: 1. mai").
export function nextPaymentDate(
  schedule: AllowanceSchedule,
  now: Date = new Date(),
): string | null {
  if (schedule.frequency === 'none') return null;

  if (schedule.frequency === 'weekly') {
    if (schedule.dayOfWeek === null) return null;
    return ymd(addDays(now, daysUntilDow(now, schedule.dayOfWeek, true)));
  }

  if (schedule.frequency === 'biweekly') {
    if (schedule.dayOfWeek === null) return null;
    if (schedule.lastPaidAt) {
      const next = new Date(schedule.lastPaidAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      if (next.getTime() > now.getTime()) return ymd(next);
    }
    return ymd(addDays(now, daysUntilDow(now, schedule.dayOfWeek, true)));
  }

  // monthly
  if (schedule.dayOfMonth === null) return null;
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const todayDom = now.getDate();
  const thisMonthLast = lastDayOfMonth(y, m);
  const thisMonthTarget = Math.min(schedule.dayOfMonth, thisMonthLast);
  if (todayDom <= thisMonthTarget) {
    return `${y}-${pad(m)}-${pad(thisMonthTarget)}`;
  }
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const nextLast = lastDayOfMonth(nextYear, nextMonth);
  const nextTarget = Math.min(schedule.dayOfMonth, nextLast);
  return `${nextYear}-${pad(nextMonth)}-${pad(nextTarget)}`;
}

function daysUntilDow(now: Date, target: number, includeToday: boolean): number {
  const today = now.getDay();
  if (includeToday && today === target) return 0;
  const diff = (target - today + 7) % 7;
  return diff === 0 ? 7 : diff;
}

function addDays(now: Date, days: number): Date {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
