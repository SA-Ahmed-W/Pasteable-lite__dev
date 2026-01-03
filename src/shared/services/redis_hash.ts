import redis from "../lib/redis";

export interface RedisHashPayload {
  content: string;
  views: number;
  maxViews: number | null; // -1 means unlimited
  ttlSeconds?: number | null; // -1 means no expiry
  createdAt: number;
  expiresAt: number | null; // in ms or -1 means never expires
}

export interface CreateHashInput {
  content: string;
  maxViews?: number | undefined;
  ttlSeconds?: number | undefined;
}

class RedisHashService {
  private static readonly DEFAULT_LIMIT = -1;

  /* ---------- Health ---------- */

  async ping(): Promise<boolean> {
    try {
      return (await redis.ping()) === "PONG";
    } catch {
      return false;
    }
  }

  /* ---------- Write ---------- */

  async create(key: string, input: CreateHashInput): Promise<void> {
    if (!key) throw new Error("Redis key is required");
    if (!input?.content) throw new Error("Content is required");

    const payload: RedisHashPayload = {
      content: input.content,
      views: 0,
      maxViews: input.maxViews ?? null,
      ttlSeconds: input.ttlSeconds ?? null,
      expiresAt: input.ttlSeconds ? Date.now() + input.ttlSeconds * 1000 : null,
      createdAt: Date.now(),
    };

    try {
      await redis.hset(key, {
        content: payload.content,
        views: payload.views,
        maxViews: payload.maxViews ?? -1,
        ttlSeconds: payload.ttlSeconds ?? -1,
        expiresAt: payload.expiresAt ?? -1,
        createdAt: payload.createdAt,
      });

      if (payload.ttlSeconds && payload.ttlSeconds > 0) {
        await this.expire(key, payload.ttlSeconds);
      }
    } catch (err) {
      throw new Error(`Redis create failed: ${(err as Error).message}`);
    }
  }

  /* ---------- Read ---------- */

  async get(key: string): Promise<RedisHashPayload | null> {
    if (!key) return null;

    const data = await redis.hgetall<Record<string, string>>(key);
    if (!data || Object.keys(data).length === 0) return null;

    return {
      content: data.content,
      views: Number(data.views),
      maxViews: data.maxViews === "-1" ? null : Number(data.maxViews),
      ttlSeconds: data.ttlSeconds === "-1" ? null : Number(data.ttlSeconds),
      expiresAt: data.expiresAt === "-1" ? null : Number(data.expiresAt),
      createdAt: Number(data.createdAt),
    };
  }

  /* ---------- View Tracking ---------- */

  async consumeView(
    key: string,
    nowMs: number
  ): Promise<RedisHashPayload | null> {
    if (!key) return null;

    const data = await redis.hgetall<Record<string, string>>(key);
    if (!data || Object.keys(data).length === 0) return null;

    const currentViews = Number(data.views);
    const maxViews = data.maxViews ? Number(data.maxViews) : null;

    // Check limit BEFORE incrementing
    if (maxViews !== -1 && maxViews !== null && currentViews >= maxViews) {
      await this.delete(key);
      return null;
    }

    // Atomically increment views
    const newViews = await redis.hincrby(key, "views", 1);

    const payload: RedisHashPayload = {
      content: data.content,
      views: newViews,
      maxViews: data.maxViews ? Number(data.maxViews) : null,
      expiresAt: data.expiresAt ? Number(data.expiresAt) : null,
      createdAt: Number(data.createdAt),
    };

    // View-limit check
    // if (payload.maxViews !== null && newViews > payload.maxViews) {
    //   return null;
    // }

    // Expiry check (test-aware)
    if (
      payload.expiresAt !== -1 &&
      payload.expiresAt !== null &&
      nowMs >= payload.expiresAt
    ) {
      await this.delete(key);
      return null;
    }

    return payload;
  }

  /* ---------- Delete ---------- */

  async delete(key: string): Promise<void> {
    if (!key) return;
    await redis.del(key);
  }

  /* ---------- Utilities ---------- */

  async exists(key: string): Promise<boolean> {
    return (await redis.exists(key)) === 1;
  }

  async ttl(key: string): Promise<number> {
    return await redis.ttl(key);
  }
  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  }
}

export const redisHashService = new RedisHashService();
