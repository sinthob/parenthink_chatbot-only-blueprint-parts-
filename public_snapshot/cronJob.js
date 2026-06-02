// Portfolio snapshot cron module.
//
// The private repo schedules reminders, retries, and admin reports.
// In the public snapshot we keep a minimal API surface but do not schedule
// real jobs or query a database.

export function registerCronJobs(_opts = {}) {
  // no-op
  return { ok: true, scheduled: false };
}

// Used by activity flow in the private repo; keep signature for compatibility.
export async function markUserActivityToday(_lineUserId) {
  return { ok: true };
}
