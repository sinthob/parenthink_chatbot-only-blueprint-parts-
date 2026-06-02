// utils/lineClient.js
// LINE messaging helpers: sanitization, error classification, and safe send wrappers.
// All functions take `client` as a parameter (not module-scope) — no external dependencies.

export const LINE_QUICK_REPLY_LABEL_MAX = 20;

export function truncateLineLabel(label, max = LINE_QUICK_REPLY_LABEL_MAX) {
  const text = (label ?? '').toString();
  if (!text) return text;
  if (!Number.isFinite(max) || max <= 0) return '';
  if (text.length <= max) return text;
  // Keep within max length, add ellipsis when possible
  return max >= 2 ? `${text.slice(0, max - 1)}…` : text.slice(0, max);
}

export function sanitizeLineMessage(message) {
  if (!message || typeof message !== 'object') return message;
  const quickReply = message.quickReply;
  if (!quickReply || !Array.isArray(quickReply.items)) return message;

  const nextItems = quickReply.items.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const action = item.action;
    if (!action || typeof action !== 'object') return item;
    if (typeof action.label !== 'string') return item;

    const nextLabel = truncateLineLabel(action.label);
    if (nextLabel === action.label) return item;

    return {
      ...item,
      action: {
        ...action,
        label: nextLabel
      }
    };
  });

  return {
    ...message,
    quickReply: {
      ...quickReply,
      items: nextItems
    }
  };
}

export function sanitizeLineMessages(messages) {
  if (Array.isArray(messages)) return messages.map(sanitizeLineMessage);
  return sanitizeLineMessage(messages);
}

export const LINE_MAX_MESSAGES_PER_API_CALL = Number(process.env.LINE_MAX_MESSAGES_PER_API_CALL || 5);

export function getLineUserIdFromEvent(event, fallbackLineUserId) {
  return fallbackLineUserId || event?.source?.userId || event?.source?.user_id || null;
}

export function getLineErrorStatus(err) {
  const direct = err?.statusCode ?? err?.status;
  if (Number.isFinite(direct)) return Number(direct);
  const nested = err?.originalError?.response?.status;
  if (Number.isFinite(nested)) return Number(nested);
  return null;
}

export function shouldFallbackToPushOnReplyError(err) {
  const status = getLineErrorStatus(err);
  const message = (err?.message || '').toString();
  const code = (err?.code || '').toString();

  // Common transient/network errors
  const transientCodes = new Set(['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND']);
  if (transientCodes.has(code)) return true;
  if (/timeout/i.test(message)) return true;

  // LINE API throttling / server errors
  if (status === 429) return true;
  if (status && status >= 500) return true;

  // Expired/invalid reply token
  if (status === 400 && /reply token/i.test(message)) return true;
  if (/invalid reply token/i.test(message)) return true;

  return false;
}

export async function safeReplyOrPush({
  client,
  event,
  replyToken,
  lineUserId,
  messages,
  notificationDisabled
}) {
  const resolvedLineUserId = getLineUserIdFromEvent(event, lineUserId);
  const sanitized = sanitizeLineMessages(messages);

  // If no replyToken, only push is possible.
  if (!replyToken) {
    if (!resolvedLineUserId) throw new Error('Cannot send LINE message: missing replyToken and lineUserId');
    return await client.pushMessage(resolvedLineUserId, sanitized);
  }

  try {
    return await client.replyMessage(replyToken, sanitized, notificationDisabled);
  } catch (err) {
    if (!resolvedLineUserId || !shouldFallbackToPushOnReplyError(err)) {
      throw err;
    }

    console.warn(
      `[LINE] replyMessage failed; falling back to push. status=${getLineErrorStatus(err)} code=${err?.code || ''} msg=${(err?.message || '').toString().slice(0, 200)}`
    );
    return await client.pushMessage(resolvedLineUserId, sanitized);
  }
}

export async function replyThenPushInBatches(client, replyToken, lineUserId, messages, notificationDisabled) {
  const normalized = Array.isArray(messages) ? messages : [messages];
  const sanitized = sanitizeLineMessages(normalized);

  const firstBatch = sanitized.slice(0, LINE_MAX_MESSAGES_PER_API_CALL);
  await safeReplyOrPush({
    client,
    event: null,
    replyToken,
    lineUserId,
    messages: firstBatch,
    notificationDisabled
  });

  const remaining = sanitized.slice(LINE_MAX_MESSAGES_PER_API_CALL);
  if (remaining.length === 0) return;

  if (!lineUserId) {
    console.warn('[LINE] Too many messages but no lineUserId for push; remaining messages will be dropped:', remaining.length);
    return;
  }

  for (let i = 0; i < remaining.length; i += LINE_MAX_MESSAGES_PER_API_CALL) {
    const chunk = remaining.slice(i, i + LINE_MAX_MESSAGES_PER_API_CALL);
    await client.pushMessage(lineUserId, chunk);
  }
}
