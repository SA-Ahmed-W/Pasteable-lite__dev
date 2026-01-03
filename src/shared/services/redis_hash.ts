import redis from "../lib/redis";

export interface RedisHashPayload {
  content: string;
  views: number;
  maxViews: number; // -1 means unlimited
  ttlSeconds: number; // -1 means no expiry
  createdAt: number;
}

export interface CreateHashInput {
  content: string;
  maxViews?: number;
  ttlSeconds?: number;
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
      maxViews: input.maxViews ?? RedisHashService.DEFAULT_LIMIT,
      ttlSeconds: input.ttlSeconds ?? RedisHashService.DEFAULT_LIMIT,
      createdAt: Date.now(),
    };

    try {
      await redis.hset(key, {
        content: payload.content,
        views: payload.views,
        maxViews: payload.maxViews,
        ttlSeconds: payload.ttlSeconds,
        createdAt: payload.createdAt,
      });

      if (payload.ttlSeconds > 0) {
        await redis.expire(key, payload.ttlSeconds);
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
      maxViews: Number(data.maxViews),
      ttlSeconds: Number(data.ttlSeconds),
      createdAt: Number(data.createdAt),
    };
  }

  /* ---------- View Tracking ---------- */

  async consumeView(key: string): Promise<RedisHashPayload | null> {
    const payload = await this.get(key);
    if (!payload) return null;

    if (
      payload.maxViews !== RedisHashService.DEFAULT_LIMIT &&
      payload.views >= payload.maxViews
    ) {
      await this.delete(key);
      return null;
    }

    try {
      await redis.hincrby(key, "views", 1);
      return { ...payload, views: payload.views + 1 };
    } catch (err) {
      throw new Error(`View increment failed: ${(err as Error).message}`);
    }
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
}

export const redisHashService = new RedisHashService();
