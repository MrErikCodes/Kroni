import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { startOfWeek } from 'date-fns';
import { getConfig } from '../config.js';

const tz = () => getConfig().APP_TIMEZONE;

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

export function startOfWeekInAppTz(now: Date = new Date()): Date {
  // ISO week starts Monday in Norway.
  return startOfWeek(toZonedTime(now, tz()), { weekStartsOn: 1 });
}

export function isoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}
