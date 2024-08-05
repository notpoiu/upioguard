"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { create_key_helper } from "@/lib/key_utils";

const SECRET_KEY = process.env.NODE_ENV == "production" ? process.env.TURNSTILE_SECRET_KEY ?? "1x00000000000000000000AA" : "1x00000000000000000000AA";

/**
Example turnstile response
{
  "success": true,
  "challenge_ts": "2022-02-28T15:14:30.096Z",
  "hostname": "example.com",
  "error-codes": [],
  "action": "login",
  "cdata": "sessionid-123456789"
}
 */
export async function verify_turnstile(minimum_checkpoint_switch_duration: number) {
  const token = cookies().get("upioguard-turnstile")?.value ?? "Invalid token";
  const host = (headers().get("host") ?? "localhost:3000").replaceAll("http://", "").replaceAll("https://", "").trim();

  if (token == "Invalid token") {
    return {
      success: false,
      challenge_ts: new Date().toISOString(),
      hostname: host,
      error_codes: [
        "upioguard-invalid-token",
      ]
    };
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify" + new URLSearchParams({
    secret: SECRET_KEY,
    response: token,
  }).toString())

  const JSON_DATA = await response.json();
  const data =  {
    success: JSON_DATA.success ?? false,
    challenge_ts: JSON_DATA.challenge_ts ?? new Date().toISOString(),
    hostname: JSON_DATA.hostname ?? host,
    error_codes: JSON_DATA.error_codes ?? [
      "upioguard-invalid-response",
    ]
  };

  const date_challenge_minimum = new Date(data.challenge_ts).getTime() + minimum_checkpoint_switch_duration * 60 * 1000;
  return data.success && date_challenge_minimum < new Date().getTime();
}

export async function set_cookie_turnstile(token: string, url: string, project_id: string) {
  cookies().set("upioguard-turnstile", token, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV == "production",
  });
  
  const keyhelper = await create_key_helper(project_id);
  await keyhelper.increment_checkpoint_index();

  redirect(url);
}