/**
 * Lightweight in-memory TTL cache. Used to stay within Finnhub's free-tier
 * rate limit (60 calls/min) by not re-fetching the same symbol's quote on
 * every request. For a multi-instance production deployment, swap this for
 * Redis (ioredis is already a dependency) — the interface below
 * (get/set/del) is intentionally Redis-compatible so that swap is a
 * drop-in change later, not a rewrite.
 */
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlSeconds) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  del(key) {
    this.store.delete(key);
  }
}

export default new MemoryCache();
