// Portfolio snapshot admin notifications.
//
// The private repository sends scheduled admin progress reports.
// This public snapshot intentionally omits DB schema details.

export function registerAdminProgressReportCron(_opts = {}) {
  // no-op
  return { ok: true, scheduled: false };
}
