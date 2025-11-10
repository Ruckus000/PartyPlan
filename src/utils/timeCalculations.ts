/**
 * Time calculation utilities for Gantt chart positioning
 *
 * Key constants:
 * - 1 minute = 4 pixels
 * - 15 minutes = 60 pixels
 * - 1 hour = 240 pixels
 * - Event start: 8PM (20:00)
 */

export const PIXELS_PER_MINUTE = 4;
export const PIXELS_PER_HOUR = PIXELS_PER_MINUTE * 60; // 240
export const PIXELS_PER_15_MIN = PIXELS_PER_MINUTE * 15; // 60

export const EVENT_START_HOUR = 13; // 1:00 PM (13:00 in 24-hour format)
export const EVENT_END_HOUR = 24; // 12:00 AM (midnight, next day)

export const MIN_EVENT_HEIGHT = 52; // Minimum visible height for all event blocks (exceeds 48dp accessibility minimum)

/**
 * Convert ISO timestamp to pixels from event start
 */
export function timeToPixels(isoTimestamp: string): number {
  const date = new Date(isoTimestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Calculate which day of the event (0 = Nov 7, 1 = Nov 8, 2 = Nov 9)
  const eventStartDate = new Date('2025-11-07T00:00:00-05:00');
  const daysDiff = Math.floor((date.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate day offset in minutes
  const hoursInDay = EVENT_END_HOUR - EVENT_START_HOUR; // 11 hours per day
  const dayOffsetMinutes = daysDiff * hoursInDay * 60;

  // Calculate time-of-day offset
  const totalMinutesFromMidnight = hours * 60 + minutes;
  const timeOfDayMinutes = totalMinutesFromMidnight - (EVENT_START_HOUR * 60);

  // Total minutes from event start
  const totalMinutes = dayOffsetMinutes + timeOfDayMinutes;

  return totalMinutes * PIXELS_PER_MINUTE;
}

/**
 * Calculate height in pixels for a duration
 * Returns raw calculated height - minimum height enforcement moved to component level
 */
export function durationToPixels(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const durationMs = end.getTime() - start.getTime();

  // Handle edge cases: zero or negative duration
  if (durationMs <= 0) {
    return 0;
  }

  const durationMinutes = durationMs / (1000 * 60);
  return durationMinutes * PIXELS_PER_MINUTE;
}

/**
 * Calculate duration in minutes
 */
export function getDurationMinutes(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const durationMs = end.getTime() - start.getTime();
  return Math.round(durationMs / (1000 * 60));
}

/**
 * Format time for display (e.g., "9:05 PM")
 */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  const minutesStr = minutes < 10 ? `0${minutes}` : minutes.toString();

  return `${hours}:${minutesStr} ${period}`;
}

/**
 * Format time range (e.g., "9:05-10:20pm")
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  let startHours = start.getHours();
  const startMinutes = start.getMinutes();
  let endHours = end.getHours();
  const endMinutes = end.getMinutes();

  const startPeriod = startHours >= 12 ? 'pm' : 'am';
  const endPeriod = endHours >= 12 ? 'pm' : 'am';

  startHours = startHours % 12 || 12;
  endHours = endHours % 12 || 12;

  const startMin = startMinutes < 10 ? `0${startMinutes}` : startMinutes;
  const endMin = endMinutes < 10 ? `0${endMinutes}` : endMinutes;

  // If same period, only show it once
  if (startPeriod === endPeriod) {
    return `${startHours}:${startMin}-${endHours}:${endMin}${endPeriod}`;
  } else {
    return `${startHours}:${startMin}${startPeriod}-${endHours}:${endMin}${endPeriod}`;
  }
}

/**
 * Format time range in compact form for tight spaces
 * Drops :00 minutes and uses shorter format
 */
export function formatCompactTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  let startHours = start.getHours();
  const startMinutes = start.getMinutes();
  let endHours = end.getHours();
  const endMinutes = end.getMinutes();

  const startPeriod = startHours >= 12 ? 'pm' : 'am';
  const endPeriod = endHours >= 12 ? 'pm' : 'am';

  startHours = startHours % 12 || 12;
  endHours = endHours % 12 || 12;

  // Build start time - omit :00 minutes
  const startStr = startMinutes === 0
    ? `${startHours}`
    : `${startHours}:${startMinutes < 10 ? `0${startMinutes}` : startMinutes}`;

  // Build end time - omit :00 minutes
  const endStr = endMinutes === 0
    ? `${endHours}`
    : `${endHours}:${endMinutes < 10 ? `0${endMinutes}` : endMinutes}`;

  // If same period, only show it once
  if (startPeriod === endPeriod) {
    return `${startStr}-${endStr}${endPeriod}`;
  } else {
    return `${startStr}${startPeriod}-${endStr}${endPeriod}`;
  }
}

/**
 * Generate time markers for the timeline (every 15 minutes) across 3 days
 */
export function generateTimeMarkers(): Array<{ time: string; day: string; isHour: boolean; topOffset: number; dayIndex: number }> {
  const markers: Array<{ time: string; day: string; isHour: boolean; topOffset: number; dayIndex: number }> = [];
  const days = ['FRI', 'SAT', 'SUN'];

  // Generate for 3 days (Nov 7, 8, 9)
  for (let dayIndex = 0; dayIndex < 3; dayIndex++) {
    // From 1:00 PM to midnight each day
    for (let hour = EVENT_START_HOUR; hour < EVENT_END_HOUR; hour++) {
      for (let quarter = 0; quarter < 4; quarter++) {
        const minutes = quarter * 15;
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const minutesStr = minutes === 0 ? '00' : minutes.toString();
        const time = `${displayHour}:${minutesStr}`;

        // Calculate offset including day offset
        const hoursInDay = EVENT_END_HOUR - EVENT_START_HOUR; // 11 hours per day
        const totalMinutesFromStart = (dayIndex * hoursInDay * 60) + (hour - EVENT_START_HOUR) * 60 + minutes;
        const topOffset = totalMinutesFromStart * PIXELS_PER_MINUTE;

        markers.push({
          time,
          day: days[dayIndex],
          isHour: minutes === 0,
          topOffset,
          dayIndex,
        });
      }
    }
  }

  return markers;
}

/**
 * Calculate current "now" position in pixels
 */
export function getCurrentTimePosition(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Calculate which day of the event (0 = Nov 7, 1 = Nov 8, 2 = Nov 9)
  const eventStartDate = new Date('2025-11-07T00:00:00-05:00');
  const daysDiff = Math.floor((now.getTime() - eventStartDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate day offset in minutes
  const hoursInDay = EVENT_END_HOUR - EVENT_START_HOUR; // 11 hours per day
  const dayOffsetMinutes = daysDiff * hoursInDay * 60;

  // Calculate time-of-day offset
  const totalMinutesFromMidnight = hours * 60 + minutes;
  const minutesFromStart = totalMinutesFromMidnight - (EVENT_START_HOUR * 60);

  // Total minutes from event start
  const totalMinutes = dayOffsetMinutes + minutesFromStart;

  return totalMinutes * PIXELS_PER_MINUTE;
}

/**
 * Calculate total timeline height
 */
export function getTimelineHeight(): number {
  const totalHours = EVENT_END_HOUR - EVENT_START_HOUR; // 11 hours per day
  return totalHours * PIXELS_PER_HOUR * 3; // 11 * 240 * 3 = 7920 (3 days)
}
