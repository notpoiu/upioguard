import { db } from "@/db";
import { NextRequest, NextResponse } from "next/server";
import { banned_users } from "@/db/schema";

export async function POST(req: NextRequest, {params}: {  params: { script_id: string } }) {
  let { hwid, reason, expiration } = await req.json();

  if (!hwid) {
    return NextResponse.json({success: false, error: "Missing required fields"})
  }

  await db.insert(banned_users).values({
    hwid: hwid as string,
    project_id: params.script_id,
    reason: reason as string,
    expires: new Date(expiration),
  });

  return NextResponse.json({success: true, banned: {hwid: hwid, reason: reason}})
}