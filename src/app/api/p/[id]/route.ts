import { redisHashService } from "@/shared/services";
import { NextRequest, NextResponse } from "next/server";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";
import { escapeHtml } from "@/shared/lib";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id?.trim()) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const redisKey = REDIS_PASTE_KEY_PREFIX + id;
    const result = await redisHashService.get(redisKey);

    if (!result) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const safeContent = escapeHtml(result.content);

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
  <pre>${safeContent}</pre>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy":
          "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      },
    });
  } catch (error) {
    console.error("GET /p/:id error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
