// Portfolio snapshot weekly surveys module.
//
// Original repo contained real Google Forms URLs and DB persistence. This public
// snapshot keeps only a minimal API with placeholder links.

const PLACEHOLDER_FORM_URL = "https://example.com/portfolio-form-placeholder";

export const WEEKLY_SURVEY_FORMS = {
  week1: PLACEHOLDER_FORM_URL,
  week2: PLACEHOLDER_FORM_URL,
  week3: PLACEHOLDER_FORM_URL,
  week4: PLACEHOLDER_FORM_URL,
};

export function getWeeklySurveyUrl(_weekNumber) {
  return PLACEHOLDER_FORM_URL;
}

export function getCompensationFormUrl() {
  return PLACEHOLDER_FORM_URL;
}

export async function markSurveySent(_userId, _weekNumber) {
  // no-op in portfolio snapshot
  return { ok: true };
}

export async function hasCompletedSurvey(_userId, _weekNumber) {
  // no DB in snapshot
  return false;
}

export async function getSurveyStatus(_userId) {
  return {
    completedWeeks: [],
    lastSentAt: null,
  };
}

// Compatibility exports for the existing app wiring.
export async function maybePushWeeklySurveyOnce(
  _lineClient,
  _dbClient,
  _user,
  _weekNumber,
  _dayNumber,
) {
  return { sent: false, reason: "portfolio_stub" };
}

export const __weeklySurveyInternal = {
  getWeeklySurveyMessage(_weekNumber, _dayNumber) {
    return "【PORTFOLIO STUB】Weekly survey is disabled in this public snapshot.";
  },
  getWeeklySurveyType(weekNumber) {
    return `weekly_survey_week_${Number(weekNumber) || 0}`;
  },
};
