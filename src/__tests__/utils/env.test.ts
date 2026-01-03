describe("Environment Configuration", () => {
  it("should be in test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });

  it("should have TEST_MODE enabled", () => {
    expect(process.env.TEST_MODE).toBe("1");
  });

  it("should load Redis configuration from .env.test", () => {
    expect(process.env.UPSTASH_REDIS_REST_URL).toBeDefined();
    expect(process.env.UPSTASH_REDIS_REST_URL).toContain("upstash");
    expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeDefined();
  });

  it("should have APP_URL configured", () => {
    expect(process.env.APP_URL).toBe("http://localhost:3000");
  });
});
