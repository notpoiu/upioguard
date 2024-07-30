import { db } from "@/db";
import { project, users } from "@/db/schema";
import { kick_script } from "@/lib/luau_utils";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm/expressions";

export async function GET(request: NextRequest) {

  const project_resp = await db.select().from(project);

  if (project_resp.length == 0) {
    return new Response(kick_script("upioguard", "No script has been initialized yet", false, ""));
  }

  const project_data = project_resp[0];

  if (project_data.project_type == "paid") {
    const key = request.headers.get("user-upioguard-key");

    if (!key) {
      return new Response(kick_script("upioguard", "Invalid key", false, ""));
    }

    const user_resp = await db.select().from(users).where(eq(users.key, key));

    if (user_resp.length == 0) {
      return new Response(kick_script("upioguard", "Invalid key", false, ""));
    }
  }

}