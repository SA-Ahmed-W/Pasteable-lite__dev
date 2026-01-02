import { redis } from "../lib";

interface RedisPayload {
  content: string;
  views: number;
  max_views: number;
  ttl_seconds: number;
  createdAt: string;
}
class RedisHashService {
  /**
   * Check if the Redis connection is alive.
   * Returns true if the connection is alive, false otherwise.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the connection is alive.
   */
  async ping(): Promise<boolean> {
    try {
      const result = await redis.ping();
      return result === "PONG";
    } catch (error) {
      console.error("Redis ping failed:", error);
      return false;
    }
  }
  async hset(
    key: string,
    value: { content: string; ttl_seconds?: number; max_views?: number }
  ): Promise<void> {
    const payload = {
      content: value.content,
      views: 0,
      max_views: value.max_views || -1,
      ttl_seconds: value.ttl_seconds || -1,
      createdAt: Date.now().toString(),
    };
    await redis.hset(key, payload);
  }

  async hincrby(
    key: string,
    field: string = "views",
    increment: number = 1
  ): Promise<void> {
    await redis.hincrby(key, field, increment);
  }

  async hgetall(key: string): Promise<RedisPayload | null> {
    const result = await redis.hgetall(key);
    if (!result) return null;
    return {
      content: result.content as string,
      views: parseInt(result.views as string),
      max_views: parseInt(result.max_views as string),
      ttl_seconds: parseInt(result.ttl_seconds as string),
      createdAt: result.createdAt as string,
    };
  }

  async hget(
    key: string,
    field: string
  ): Promise<Record<string, unknown> | null> {
    return await redis.hget(key, field);
  }
  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  }
}
const redisHashService = new RedisHashService();

export { redisHashService };
