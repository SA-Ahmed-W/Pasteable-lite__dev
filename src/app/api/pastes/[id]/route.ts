import { redisHashService } from "@/shared/services";
import { NextRequest, NextResponse } from "next/server";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const redisKey = REDIS_PASTE_KEY_PREFIX + id;
    const result = await redisHashService.consumeView(redisKey);

    if (!result) {
      return NextResponse.json(
        { error: "Paste not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        content: result.content,
        remaining_views:
          result.maxViews === -1
            ? null
            : Math.max(0, result.maxViews - result.views),
        expires_at:
          result.ttlSeconds === -1
            ? null
            : result.createdAt + result.ttlSeconds * 1000,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /paste error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
