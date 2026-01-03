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
    const redisKey = REDIS_PASTE_KEY_PREFIX + id;
    const paste = await redisHashService.get(redisKey);

    if (!paste) {
      return new NextResponse("Not Found Paste", { status: 404 });
    }

    const nowMs =
      env.TEST_MODE && req.headers.get("x-test-now-ms")
        ? Number(req.headers.get("x-test-now-ms"))
        : Date.now();

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
  <title>Paste ${escapeHtml(id)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', sans-serif;
      background: #000000;
      background-image: 
        radial-gradient(at 0% 0%, rgba(30, 30, 46, 0.5) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(24, 24, 37, 0.5) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(30, 30, 46, 0.5) 0px, transparent 50%),
        radial-gradient(at 0% 100%, rgba(24, 24, 37, 0.5) 0px, transparent 50%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .container {
      max-width: 900px;
      width: 100%;
      background: rgba(30, 30, 46, 0.6);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }
    
    .header {
      padding: 2rem;
      background: linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }
    
    .paste-id {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.375rem 0.875rem;
      border-radius: 8px;
      display: inline-block;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: rgba(255, 255, 255, 0.05);
    }
    
    .meta-item {
      padding: 1.5rem 2rem;
      background: rgba(24, 24, 37, 0.4);
      backdrop-filter: blur(20px);
    }
    
    .meta-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    
    .meta-value {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    
    .content {
      padding: 2rem;
      background: rgba(18, 18, 27, 0.4);
      backdrop-filter: blur(20px);
    }
    
    .content-label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    pre {
      background: rgba(0, 0, 0, 0.4);
      color: rgba(255, 255, 255, 0.95);
      padding: 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.7;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    
    .footer {
      padding: 1.25rem 2rem;
      background: rgba(18, 18, 27, 0.4);
      backdrop-filter: blur(20px);
      text-align: center;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.3);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    @media (max-width: 640px) {
      body {
        padding: 1rem;
      }
      
      .header {
        padding: 1.5rem;
      }
      
      .meta {
        grid-template-columns: 1fr;
      }
      
      .meta-item {
        padding: 1rem 1.5rem;
      }
      
      .content {
        padding: 1.5rem;
      }
      
      pre {
        font-size: 0.8125rem;
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pasteable-Lite</h1>
      <div class="paste-id">ID: ${escapeHtml(id)}</div>
    </div>
    
    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Expires</div>
        <div class="meta-value">${escapeHtml(expiresText)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Views</div>
        <div class="meta-value">${escapeHtml(viewsText)}</div>
      </div>
    </div>
    
    <div class="content">
      <div class="content-label">Content</div>
      <pre>${safeContent}</pre>
    </div>
    
    <div class="footer">
      Shared via Pasteable-Lite
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": [
          "default-src 'none'", // Block everything by default
          "style-src 'unsafe-inline'", // Allow inline styles
          "connect-src 'self'", // Allow same-origin XHR/fetch/websocket
          "script-src 'none'", // Block all JavaScript (security!)
          "img-src 'self' data:", // Allow images if you add them later
          "base-uri 'none'", // Prevent <base> tag hijacking
          "frame-ancestors 'none'", // Prevent embedding in iframes
          "form-action 'none'", // Block forms (extra security)
        ].join("; "),
      },
    });
  } catch (error) {
    console.error("GET /p/:id error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
