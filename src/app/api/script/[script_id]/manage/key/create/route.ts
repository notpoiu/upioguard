import { db } from "@/db";
import { users } from "@/db/schema";
import { generate_key } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, {params}: { params: {script_id: string} }) {
  let { 
    discord_id,
    username,
    note,
    key_expires,
    key_type
  } = await req.json();

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

  await db.insert(users).values({
    project_id: params.script_id,
    discord_id: discord_id,
    username: username,
    note: note,
    key_expires: key_expires ?? null,
    key_type: key_type,
    key: new_key,
  });

  return NextResponse.json({
    success: true,
    key: new_key
  })
}