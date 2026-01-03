# TEST RUNNER

### Run tests in watch mode

`pnpm test`

### Run tests once

`pnpm test:once`

### Run with coverage

`pnpm test:ci`

### Run specific test file

`pnpm test pastes-create`

# Docker CMD

```
docker run -d \
  -p 3000:3000 \
  -e UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io" \
  -e UPSTASH_REDIS_REST_TOKEN="your-token" \
  -e APP_URL="http://localhost:3000" \
  -e TEST_MODE="0" \
  --name pasteable \
  pasteable
```
