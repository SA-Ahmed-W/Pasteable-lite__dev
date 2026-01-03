import { NextRequest, NextResponse } from "next/server";
import { redisHashService } from "@/shared/services";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";
import { env } from "@/shared/lib";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || !id.trim()) {
      return NextResponse.json({ error: "Invalid paste id" }, { status: 404 });
    }

    const nowMs =
      env.TEST_MODE && req.headers.get("x-test-now-ms")
        ? Number(req.headers.get("x-test-now-ms"))
        : Date.now();

    const redisKey = REDIS_PASTE_KEY_PREFIX + id;
    const result = await redisHashService.consumeView(redisKey, nowMs);

    if (!result) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        content: result.content,
        remaining_views:
          result.maxViews === -1 || result.maxViews === null
            ? null
            : Math.max(0, result.maxViews - result.views),
        expires_at:
          result.expiresAt === -1 || result.expiresAt === null
            ? null
            : new Date(result.expiresAt).toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/pastes/:id error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
