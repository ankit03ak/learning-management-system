const buckets = new Map();

const createRateLimiter = ({ windowMs, max, message }) => {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(key);
    }
  }, windowMs);
  cleanupInterval.unref();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl || ""}${req.path}`;
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.expiresAt <= now) {
      bucket = { count: 0, expiresAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    res.set("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));

    if (bucket.count > max) {
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
};

module.exports = { createRateLimiter };
