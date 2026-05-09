import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const KEY = "cards_generated";

function getRedis() {
  const url   = process.env.KV_REST_API_URL   ?? process.env.UPSTASH_REDIS_REST_URL   ?? "";
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return new Redis({ url, token });
}

export async function GET() {
  try {
    const count = (await getRedis().get<number>(KEY)) ?? 0;
    return NextResponse.json({ count });
  } catch (e) {
    console.error("[count GET]", e);
    return NextResponse.json({ count: 0 });
  }
}

export async function POST() {
  try {
    const count = await getRedis().incr(KEY);
    return NextResponse.json({ count });
  } catch (e) {
    console.error("[count POST]", e);
    return NextResponse.json({ count: 0 });
  }
}
