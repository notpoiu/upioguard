import { db } from "@/db";
import { Key, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request, {params}: {params: {script_id: string}}) {
  let {
    data,
    discord_id
  } = await request.json();

  data = data as Key;
  console.log(JSON.stringify(data));

  await db.update(users).set(data).where(eq(users.discord_id, discord_id));

  return new Response(JSON.stringify({
    success: true
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}