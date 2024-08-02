import { auth } from "@/auth";
import { db } from "@/db";
import { project_api_keys } from "@/db/schema";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { banned_users } from "@/db/schema";
import { NextResponse } from "next/server";
import { validate_permissions } from "@/app/dashboard/server";

export async function POST(req: NextRequest, params: { script_id: string }) {
  let { hwid, reason } = await req.json();

  const session = await auth();

  const resp_project_api_keys = await db.select().from(project_api_keys).where(eq(project_api_keys.project_id, params.script_id));
  const valid_keys = resp_project_api_keys.map((x) => x.api_key);

  if (!session && !valid_keys.includes(req.headers.get("api-key") as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    await validate_permissions(params.script_id);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.insert(banned_users).values({
    hwid: hwid,
    reason: reason,
  });

  return NextResponse.json({success: true, banned: {hwid: hwid, reason: reason}})
}