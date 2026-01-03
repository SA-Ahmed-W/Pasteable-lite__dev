function getEnv(name: string, required?: boolean): string {
  const value = process.env[name];

  if (!value) {
    if (required) {
      // Only log warning, don't throw during build
      if (typeof window === "undefined") {
        console.warn(`⚠️  Missing required environment variable: ${name}`);
      }
    }
    return "";
  }

  return value;
}

export const env = {
  UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL", true),
  UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN", true),
  APP_URL: getEnv("APP_URL", true),
  TEST_MODE: getEnv("TEST_MODE") === "1",
} as const;
