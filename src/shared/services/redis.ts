import { redis } from "../lib";

class RedisService {
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
}
const redisService = new RedisService();

export { redisService };
