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
export async function verify_turnstile(url: string, project_id: string, token: string) {
  if (process.env.NODE_ENV == "development") {
    return true;
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: JSON.stringify({
      secret: SECRET_KEY,
      response: token,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
  
  const JSON_DATA = await response.json();
  if (JSON_DATA.success) {
    const KeyUtility = await create_key_helper(project_id);
    const response = await KeyUtility.increment_checkpoint_index();

    if (response) {
      redirect(url);
    } else {
      return false;
    }
  }

  return true;
}