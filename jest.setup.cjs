// eslint-disable-next-line @typescript-eslint/no-require-imports
const { loadEnvConfig } = require("@next/env");

// Load environment variables based on NODE_ENV
const projectDir = process.cwd();
loadEnvConfig(projectDir);

// Force TEST_MODE for all tests
process.env.TEST_MODE = "1";

// Validate required env vars
const requiredEnvVars = [
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "APP_URL",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Missing ${envVar} in .env.test`);
  }
});

// Set fallback for APP_URL if missing
if (!process.env.APP_URL) {
  process.env.APP_URL = "http://localhost:3000";
}

// Optional: Global test timeout
jest.setTimeout(10000); // 10 seconds
