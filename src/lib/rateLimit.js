// src/lib/rateLimit.js
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 5 запитів / 10 хв, ковзне вікно
const redis =
  global.__redis ??
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

if (!global.__redis) global.__redis = redis;

const limiter =
  global.__contactLimiter ??
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true, // зручно для дашборду
    prefix: "rl:contact", // namespace ключів
  });

if (!global.__contactLimiter) global.__contactLimiter = limiter;

/**
 * Лімітує за ключем (наприклад, IP).
 * Повертає: { success, limit, remaining, reset }
 */
export async function limitByKey(key) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Якщо Redis не налаштований — пропускаємо (без ліміту)
    return { success: true, limit: 9999, remaining: 9998, reset: Date.now() + 1000 };
    }
  const res = await limiter.limit(key);
  return res;
}
