import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

const KEY = "cards_generated";

export async function GET() {
  const count = (await kv.get<number>(KEY)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await kv.incr(KEY);
  return NextResponse.json({ count });
}
