import { NextResponse } from "next/server";
import { pasteSchema } from "@/shared/schema";
import { isZodError, defaultIDGenerator, env } from "@/shared/lib";
import { redisHashService } from "@/shared/services";
import { REDIS_PASTE_KEY_PREFIX } from "@/shared/constants";
export async function POST(req: Request) {
  try {
    const reqx = await req.json();
    if (pasteSchema.parse(reqx)) {
      const id = defaultIDGenerator.generate(10);
      const key = REDIS_PASTE_KEY_PREFIX + id;
      const url = env.APP_URL + "/p/" + key;
      const payload = {
        content: reqx.content,
        ttl_seconds: reqx?.ttl_seconds || -1,
        max_views: reqx?.max_views || -1,
      };
      await redisHashService.hset(key, payload);
      if (payload.ttl_seconds && payload.ttl_seconds > 0) {
        await redisHashService.expire(key, payload.ttl_seconds);
      }
      return NextResponse.json({ id, url }, { status: 201 });
    }
    return NextResponse.json("Invalid data", { status: 400 });
  } catch (error) {
    if (isZodError(error)) {
      const messages = error.issues.map((e) => e.message).join(", ");
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
