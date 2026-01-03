import { redisHashService } from "@/shared/services";
import { NextRequest, NextResponse } from "next/server";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";
import { env, escapeHtml } from "@/shared/lib";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !id.trim()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const nowMs =
      env.TEST_MODE && req.headers.get("x-test-now-ms")
        ? Number(req.headers.get("x-test-now-ms"))
        : Date.now();

    const redisKey = REDIS_PASTE_KEY_PREFIX + id;
    const paste = await redisHashService.get(redisKey);

    if (!paste) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Availability checks
    if (
      paste.maxViews !== null &&
      paste.maxViews !== -1 &&
      paste.views >= paste.maxViews
    ) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (
      paste.expiresAt !== null &&
      paste.expiresAt !== -1 &&
      nowMs >= paste.expiresAt
    ) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'",
        },
      });
    }

    const safeContent = escapeHtml(paste.content);

    const expiresText =
      paste.expiresAt === -1 || paste.expiresAt === null
        ? "Never"
        : new Date(paste.expiresAt).toISOString();

    const viewsText =
      paste.maxViews === null || paste.maxViews === -1
        ? `${paste.views} / ∞`
        : `${paste.views} / ${paste.maxViews}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Paste ${id}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #e5e7eb;
      padding: 2rem;
    }
    .meta {
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: #94a3b8;
    }
    pre {
      background: #020617;
      padding: 1.25rem;
      border-radius: 6px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="meta">
    <div><strong>Expires:</strong> ${expiresText}</div>
    <div><strong>Views:</strong> ${viewsText}</div>
  </div>
  <pre>${safeContent}</pre>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      },
    });
  } catch (error) {
    console.error("GET /p/:id error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
