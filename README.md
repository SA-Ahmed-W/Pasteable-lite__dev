# Pasteable

A lightweight, high-performance pastebin application built with Next.js 15 and Redis. Share text snippets with optional time-based expiry and view limits.

Live Demo: [https://pasteable-lite.vercel.app/](https://pasteable-lite.vercel.app/)

## About The Project

Pasteable is a modern take on the classic pastebin concept, designed for speed and simplicity. Users can create text pastes and share them via unique URLs. Each paste can optionally include time-to-live (TTL) constraints or view count limits, making it perfect for sharing temporary code snippets, logs, or sensitive information that should expire automatically.

The application is built with serverless deployment in mind, using Upstash Redis for persistence and Next.js App Router for optimal performance. It supports deterministic time testing for automated grading and includes production-ready security features like XSS prevention and Content Security Policy headers.

## Features

- **Create & Share** - Generate unique URLs for text pastes instantly
- **Time-Based Expiry** - Set optional TTL (time-to-live) in seconds
- **View Limits** - Restrict pastes to a maximum number of views
- **API-First Design** - RESTful API with JSON responses
- **Real-Time Expiry** - Pastes become unavailable immediately after constraints are met
- **Secure Rendering** - HTML-escaped content prevents XSS attacks
- **Health Monitoring** - Built-in health check endpoint with Redis connectivity status
- **Deterministic Testing** - Support for `TEST_MODE` with custom time headers for automated testing [file:1]
- **Docker Ready** - Optimized Docker image with standalone output

## Tech Stack

**Frontend & Backend:**

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling

**Database:**

- [Upstash Redis](https://upstash.com/) - Serverless Redis with REST API
- `@upstash/redis` - Official Redis SDK

**Validation & Testing:**

- [Zod](https://zod.dev/) - Schema validation
- [Jest](https://jestjs.io/) - Unit and integration testing
- [Supertest](https://github.com/visionmedia/supertest) - API endpoint testing

**Deployment:**

- [Docker](https://www.docker.com/) - Containerization
- [Vercel](https://vercel.com/) - Serverless deployment platform (recommended) [file:1]

## Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v22 or higher
- [pnpm](https://pnpm.io/) v10 or higher
- [Upstash Redis](https://upstash.com/) account (free tier available)

### Setup Instructions

1. **Clone the repository**
   ```bash
   1. git clone https://github.com/SAASIMAHMEDW/Pasteable-lite
   2. cd pastebin
   ```
2. **Install dependencies**

   ```code
   pnpm install
   ```

3. **Set up environment variables**: Create a .env.local file in the root directory:

```bash
cp .env.example .env.local
```

4. **Add your Upstash Redis credentials:**

```bash
# Upstash Redis configuration
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Application URL
APP_URL=http://localhost:3000

# Test mode (optional)
TEST_MODE=0
```

5. **Run the development server**

```bash
pnpm dev
```

Open http://localhost:3000 in your browser.

6. **Run tests**

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:once

# Run with coverage
pnpm test:ci
```

## Running With Docker

### Prerequisites

- [Docker](https://nodejs.org/) v22 or higher

### Setup Instructions

1. **Build the Docker image**

```bash
docker build -t pasteable:latest .
```

2. **Run the container**

```bash
docker run -d \
  -p 3000:3000 \
  -e UPSTASH_REDIS_REST_URL="your-redis-url" \
  -e UPSTASH_REDIS_REST_TOKEN="your-token" \
  -e APP_URL="http://localhost:3000" \
  -e TEST_MODE="0" \
  --name pastebin \
  pasteable:latest
```

## API Endpoints

### Paste Service API

### Health Check

### Endpoint

`GET /api/healthz`

Returns the health status of the application and Redis connectivity.

### Response (200 OK)

```json
{
  "ok": true
   ...
}
```

### Example

```bash
curl http://localhost:3000/api/healthz
```

### Create a Paste

#### Endpoint

`POST /api/pastes`

Creates a new paste with optional TTL and view limits.

#### Request Body

```json
{
  "content": "string (required, non-empty)",
  "ttl_seconds": 60,
  "max_views": 5
}
```

- content: required, must be a non-empty string

- ttl_seconds: optional, integer ≥ 1

- max_views: optional, integer ≥ 1

#### Response (201 Created)

```json
{
  "id": "abc123def4",
  "url": "http://localhost:3000/p/abc123def4"
}
```

#### Error Response (400 Bad Request)

```json
{
  "error": "content is required"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, World!",
    "ttl_seconds": 300,
    "max_views": 10
  }'
```

### Fetch a Paste (API)

#### Endpoint

`GET /api/pastes/:id`

Retrieves paste content and metadata.
Each successful fetch counts as a view.

#### Response (200 OK)

```json
{
  "content": "Hello, World!",
  "remaining_views": 9,
  "expires_at": "2026-01-04T05:30:00.000Z"
}
```

#### Notes

- remaining_views is null if unlimited

- expires_at is null if no TTL

- View count increments on each successful fetch

#### Error Response (404 Not Found)

```json
{
  "error": "Paste not found"
}
```

#### Returned when:

- Paste does not exist

- TTL has expired

- View limit has been exceeded

#### Example

```bash
curl http://localhost:3000/api/pastes/abc123def4
```

#### Test Mode (Deterministic Time)

```bash
curl http://localhost:3000/api/pastes/abc123def4 \
 -H "x-test-now-ms: 1735930061000"
```

### View a Paste (HTML)

#### Endpoint

`GET /p/:id`

Renders the paste content as HTML in the browser.
This does not count as a view.

#### Response (200 OK)

Returns an HTML page containing:

- Safely escaped paste content

- Expiry time

- View count statistics

- Dark glassmorphism theme

#### Error Response (404 Not Found)

Returns an HTML 404 page when the paste is unavailable.

#### Example

##### Open in browser

`open http://localhost:3000/p/abc123def4`

#### Or view HTML via curl

`bash curl http://localhost:3000/p/abc123def4`

#### Request and Response Rules

Content-Type

- All API responses return application/json

- HTML route returns text/html; charset=utf-8

#### Status Codes

- 200 Success (GET requests)

- 201 Created (POST requests)

- 400 Bad Request (invalid input)

- 404 Not Found (missing or expired paste)

- 500 Internal Server Error

### Constraints

If both ttl_seconds and max_views are set, the paste expires when either limit is reached

- Expired pastes always return 404

- View count never goes negative

## Persistence Layer

This application uses **Upstash Redis** as its persistence layer [file:1].

**Why Upstash Redis:**

- **Serverless-compatible** - Works seamlessly with Vercel and other serverless platforms [file:1]
- **REST API** - HTTP-based, no persistent connections required
- **Global replication** - Low latency worldwide
- **Built-in durability** - Data persists across serverless function invocations

**Data Model:**

Pastes are stored as Redis hashes with the following structure:

```Key: paste:<id>
Fields:

content: string

views: number

maxViews: number | -1 (unlimited)

expiresAt: timestamp | -1 (never expires)

createdAt: timestamp
```

**Design Decisions:**

- **Timestamp-based expiry** instead of Redis TTL - Allows distinguishing between "never existed" and "expired" pastes
- **Atomic view counting** using `HINCRBY` - Prevents race conditions under concurrent load
- **No global state** - All state stored in Redis, safe for serverless environments

---

## Design Decisions

### 1. Deterministic Time Testing

Supports `TEST_MODE=1` with `x-test-now-ms` header for instant TTL testing without waiting for real time to pass. This enables automated grading systems to verify expiry logic immediately.

### 2. View Counting Strategy

- API endpoint (`GET /api/pastes/:id`) increments view count
- HTML endpoint (`GET /p/:id`) does NOT increment count
- Prevents accidental exhaustion when viewing in browser

### 3. Security Measures

- **XSS Prevention:** All paste content is HTML-escaped before rendering
- **Content Security Policy:** Strict CSP headers prevent script injection
- **No hardcoded secrets:** Environment variables for all sensitive data
- **Safe rendering:** No script execution in paste viewer

### 4. Error Handling

All unavailable pastes (missing, expired, or view limit exceeded) consistently return HTTP 404 with JSON error body, making the API predictable and easy to test.

---

## Live Links

Live Demo: [https://pasteable-lite.vercel.app/](https://pasteable-lite.vercel.app/)
