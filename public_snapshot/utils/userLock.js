const DEFAULT_LOCK_TTL_MS = 120_000;

// In-memory per-user lock (safe for single-instance deployments).
// Map key: LINE userId, value: { expiresAt: number }
const locks = new Map();

function normalizeUserId(userId) {
  return (userId || '').toString();
}

export function isUserLocked(userId) {
  const key = normalizeUserId(userId);
  if (!key) return false;

  const entry = locks.get(key);
  if (!entry) return false;

  const now = Date.now();
  if (typeof entry.expiresAt !== 'number' || now >= entry.expiresAt) {
    locks.delete(key);
    return false;
  }

  return true;
}

export function tryAcquireUserLock(userId, ttlMs = DEFAULT_LOCK_TTL_MS) {
  const key = normalizeUserId(userId);
  if (!key) return false;

  if (isUserLocked(key)) return false;

  const ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_LOCK_TTL_MS;
  locks.set(key, { expiresAt: Date.now() + ttl });
  return true;
}

export function releaseUserLock(userId) {
  const key = normalizeUserId(userId);
  if (!key) return;
  locks.delete(key);
}

// Extends the expiry of an existing lock (does not acquire a new lock).
// Returns true if a live lock was refreshed.
export function refreshUserLock(userId, ttlMs = DEFAULT_LOCK_TTL_MS) {
  const key = normalizeUserId(userId);
  if (!key) return false;

  const entry = locks.get(key);
  if (!entry) return false;

  const now = Date.now();
  if (typeof entry.expiresAt !== 'number' || now >= entry.expiresAt) {
    locks.delete(key);
    return false;
  }

  const ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_LOCK_TTL_MS;
  entry.expiresAt = now + ttl;
  return true;
}

// Starts a lightweight timer that keeps the lock alive while work is in-flight.
// Returns a stop() function.
export function startUserLockAutoRefresh(userId, ttlMs = DEFAULT_LOCK_TTL_MS, refreshEveryMs) {
  const ttl = Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : DEFAULT_LOCK_TTL_MS;
  const every = Number.isFinite(refreshEveryMs) && refreshEveryMs > 0
    ? refreshEveryMs
    : Math.min(30_000, Math.max(5_000, Math.floor(ttl / 2)));

  const intervalId = setInterval(() => {
    refreshUserLock(userId, ttl);
  }, every);

  // Don't keep the process alive just because of a lock timer.
  if (typeof intervalId?.unref === 'function') intervalId.unref();

  return function stop() {
    clearInterval(intervalId);
  };
}

export function getDefaultLockTtlMs() {
  return DEFAULT_LOCK_TTL_MS;
}
