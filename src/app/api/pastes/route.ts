import { NextResponse } from "next/server";
import { pasteSchema } from "@/shared/schema";
import { isZodError, defaultIDGenerator, env } from "@/shared/lib";
import { redisHashService } from "@/shared/services";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    pasteSchema.parse(body);

    const id = defaultIDGenerator.generate(10);
    const redisKey = REDIS_PASTE_KEY_PREFIX + id;

    await redisHashService.create(redisKey, {
      content: body.content,
      ttlSeconds: body.ttl_seconds ?? -1,
      maxViews: body.max_views ?? -1,
    });

    return NextResponse.json(
      {
        id,
        url: `${env.APP_URL}/p/${id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isZodError(error)) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    console.error("POST /paste error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
