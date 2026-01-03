import { NextRequest } from "next/server";

export function createMockRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): NextRequest {
  const { method = "GET", headers = {}, body } = options;

  return new NextRequest(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function generateTestTimestamp(offsetSeconds: number = 0): number {
  return Date.now() + offsetSeconds * 1000;
}

export async function createTestPaste(
  content: string,
  ttlSeconds?: number,
  maxViews?: number
) {
  const { POST } = await import("@/app/api/pastes/route");

  const req = createMockRequest("http://localhost:3000/api/pastes", {
    method: "POST",
    body: {
      content,
      ttl_seconds: ttlSeconds,
      max_views: maxViews,
    },
  });

  const response = await POST(req);
  const data = await response.json();
  return data;
}
