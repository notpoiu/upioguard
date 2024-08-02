import { db } from "@/db";
import { users } from "@/db/schema";
import { randomString, getRandomArbitrary } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

function generate_key() {
  return "upioguard-" + randomString(getRandomArbitrary(10, 15));
}

export async function POST(req: NextRequest, params: { script_id: string }) {
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
    key: new_key
  })
}