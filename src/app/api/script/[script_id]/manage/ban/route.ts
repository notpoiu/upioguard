import { db } from "@/db";
import { NextRequest } from "next/server";
import { banned_users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest, params: { script_id: string }) {
  let { hwid, reason } = await req.json();

  await db.insert(banned_users).values({
    hwid: hwid,
    reason: reason,
  });

  return NextResponse.json({success: true, banned: {hwid: hwid, reason: reason}})
}