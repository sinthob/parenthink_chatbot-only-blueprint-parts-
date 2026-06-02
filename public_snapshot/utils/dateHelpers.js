// utils/dateHelpers.js
// Pure date/timezone utility functions. No external dependencies.

export function getNowInTimezone(timeZone) {
  // NOTE: Do NOT round-trip through toLocaleString() + new Date().
  // That pattern applies the timezone twice and can shift dates (e.g., Bangkok evening becomes next day).
  // We keep this helper for API compatibility, but "now" should be represented by the current instant.
  // Consumers should use Intl.DateTimeFormat with the desired timeZone.
  try {
    // Validate timeZone (may throw RangeError for invalid IANA ids)
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
  } catch {
    // Ignore invalid timezone and fall back to system time.
  }
  return new Date();
}

export function getYmdInTimezone(date, timeZone) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return fmt.format(date);
}

export function parseYmdToUtcDate(ymd) {
  const [y, m, d] = String(ymd || '').split('-').map((x) => Number(x));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatThaiDateForProgramStart(ymd, timeZone, style = 'long') {
  const dt = parseYmdToUtcDate(ymd);
  if (!dt) return '';
  try {
    const tz = (timeZone || 'Asia/Bangkok').trim();
    if (style === 'short') {
      // th-TH uses Buddhist calendar by default (e.g., 2026 -> 2569 => "69" for 2-digit year).
      return new Intl.DateTimeFormat('th-TH', {
        timeZone: tz,
        day: 'numeric',
        month: 'numeric',
        year: '2-digit'
      }).format(dt);
    }
    return new Intl.DateTimeFormat('th-TH', {
      timeZone: tz,
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(dt);
  } catch {
    return '';
  }
}

export function addDaysUtc(dateUtc, days) {
  const d = new Date(dateUtc);
  d.setUTCDate(d.getUTCDate() + Number(days));
  return d;
}

export function isWeekendYmd(ymd, timeZone) {
  const dt = parseYmdToUtcDate(ymd);
  if (!dt) return false;
  try {
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short'
    }).format(dt);
    return weekday === 'Sat' || weekday === 'Sun';
  } catch {
    // If timezone is invalid, fall back to UTC interpretation of the date.
    const day = dt.getUTCDay();
    return day === 0 || day === 6;
  }
}

export function findFirstWeekdayOnOrAfter(startYmd, timeZone, maxLookaheadDays = 14) {
  const start = parseYmdToUtcDate(startYmd);
  if (!start) return null;
  for (let i = 0; i <= maxLookaheadDays; i += 1) {
    const candidateUtc = addDaysUtc(start, i);
    const candidateYmd = getYmdInTimezone(candidateUtc, timeZone);
    if (!isWeekendYmd(candidateYmd, timeZone)) return candidateYmd;
  }
  return startYmd;
}
