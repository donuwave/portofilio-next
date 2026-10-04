/**
 * A small in-memory sliding-window limiter. Enough for a single-instance
 * personal site; a restart only resets the counters.
 */
export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const hits = new Map<string, number[]>();

  const recent = (key: string) => {
    const now = Date.now();
    const list = (hits.get(key) ?? []).filter((at) => now - at < windowMs);
    if (list.length === 0) hits.delete(key);
    else hits.set(key, list);
    return list;
  };

  return {
    isBlocked: (key: string) => recent(key).length >= max,
    record: (key: string) => hits.set(key, [...recent(key), Date.now()]),
    reset: (key: string) => hits.delete(key),
  };
}

/** The client IP as Caddy reports it (it overwrites any X-Forwarded-For the client sent). */
export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
