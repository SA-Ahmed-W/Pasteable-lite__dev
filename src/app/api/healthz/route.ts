import { formatTime } from "@/shared/lib";
import { NextResponse } from "next/server";
import { redisService } from "@/shared/services/redis";

export async function GET() {
  const dbStatus = await redisService.ping();

  const uptimeSeconds = process.uptime();
  const uptimeMs = Math.floor(uptimeSeconds * 1000);

  const humanUptime = formatTime(uptimeSeconds);

  return NextResponse.json({
    ok: dbStatus,
    api_version: "1.0",
    dbStatus,
    datetime: new Date().toISOString(),
    nodeVersion: process.version,
    uptimeSeconds,
    uptimeMs,
    uptime: humanUptime,
  });
}
