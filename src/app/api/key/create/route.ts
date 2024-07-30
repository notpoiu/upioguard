import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { get } from "http";
import { NextRequest, NextResponse } from "next/server";

function randomString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getRandomArbitrary(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generate_key() {
  return "upioguard-" + randomString(getRandomArbitrary(10, 15));
}

export async function POST(req: NextRequest) {
  let { 
    discord_id,
    username,
    note,
    key_expires,
    key_type
  } = await req.json();

  const session = await auth();

  if (!session && req.headers.get("api-key") != process.env.API_KEY) {
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

  await db.insert(users).values({
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