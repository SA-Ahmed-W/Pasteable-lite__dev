import { redisHashService } from "@/shared/services";
import { NextRequest, NextResponse } from "next/server";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const result = await redisHashService.hgetall(REDIS_PASTE_KEY_PREFIX + id);

    if (!result) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 });
    }
    if (result.max_views !== -1 && result.views >= result.max_views) {
      await redisHashService.del(REDIS_PASTE_KEY_PREFIX + id);
      return NextResponse.json({ error: "Paste has expired" }, { status: 404 });
    }
    await redisHashService.hincrby(REDIS_PASTE_KEY_PREFIX + id);

    const payload = {
      content: result.content,
      remaining_views:
        result.max_views === -1
          ? null
          : Math.max(0, result.max_views - result.views - 1),
      expires_at:
        result.ttl_seconds === -1
          ? null
          : parseInt(result.createdAt) + result.ttl_seconds * 1000,
    };
    return NextResponse.json(payload, { status: 200 });
  } catch (error: unknown) {
    console.error(`GET /[code] error:`, error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
