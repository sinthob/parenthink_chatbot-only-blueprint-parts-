// Portfolio snapshot feedback module.
//
// The private version stores prompts/responses and user metadata. In a public
// repo we only keep a minimal interface so the app can run and demonstrate the
// architecture.

export async function logFeedbackRequest(_payload) {
  return { ok: true };
}

export async function logFeedbackResponse(_payload) {
  return { ok: true };
}

export async function saveFeedbackResult(_payload) {
  return { ok: true };
}

export async function saveAnswerFeedback(_payload) {
  return { ok: true };
}

export async function getFeedbackForAnswer(_opts = {}) {
  return '【PORTFOLIO STUB】Feedback generation is disabled in this public snapshot.';
}
