import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { randomString, getRandomArbitrary } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { project_api_keys } from "@/db/schema";
import { eq } from "drizzle-orm";

function generate_key() {
  return "upioguard-" + randomString(getRandomArbitrary(10, 15));
}

export async function POST(req: NextRequest) {
  let { 
    discord_id,
    username,
    note,
    key_expires,
    key_type,
    script_id
  } = await req.json();

  const session = await auth();

  const resp_project_api_keys = await db.select().from(project_api_keys).where(eq(project_api_keys.project_id, script_id));
  const valid_keys = resp_project_api_keys.map((x) => x.api_key);

  if (!session && !valid_keys.includes(req.headers.get("api-key") as string)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const new_key = generate_key();

  if (note == "") {
    note = null;
  }

  if (key_expires) {
    key_expires = new Date(key_expires);
  }

  if (key_type == "permanent") {
    key_expires = null;
  }

  if (script_id == "" && !script_id) {
    return NextResponse.json({ error: "Script ID is required" }, { status: 400 });
  }

  await db.insert(users).values({
    project_id: script_id,
    discord_id: discord_id,
    username: username,
    note: note,
    key_expires: key_expires ?? null,
    key_type: key_type,
    key: new_key,
  });

  return NextResponse.json({
    key: new_key
  })
}