import { formatTime } from "@/shared/lib";
import { NextResponse } from "next/server";
import { redisHashService } from "@/shared/services";

export async function GET() {
  const dbStatus = await redisHashService.ping();

  const uptimeSeconds = process.uptime();
  const uptimeMs = Math.floor(uptimeSeconds * 1000);

  const humanUptime = formatTime(uptimeSeconds);

  return NextResponse.json({
    ok: dbStatus,
    api_version: "1.0",
    redis: dbStatus,
    datetime: new Date().toISOString(),
    uptimeSeconds,
    uptimeMs,
    uptimeHuman: humanUptime,
  });
}
