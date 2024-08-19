import { db } from "@/db";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { banned_users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let { hwid } = await req.json();

  const deleted_response = await db.delete(banned_users).where(eq(banned_users.hwid, hwid)).returning();

  return NextResponse.json({success: true, banned: deleted_response})
}