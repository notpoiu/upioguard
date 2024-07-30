import { db } from "@/db";
import { project, users } from "@/db/schema";
import { kick_script } from "@/lib/luau_utils";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm/expressions";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function GET(request: NextRequest) {

  const project_resp = await db.select().from(project);

  if (project_resp.length == 0) {
    return new Response(kick_script("upioguard", "No script has been initialized yet", false, ""));
  }

  const project_data = project_resp[0];

  if (project_data.project_type == "paid") {
    const key = request.headers.get("user-upioguard-key");

    const error_script = kick_script("upioguard", "Invalid key provided", false, "");

    if (!key) {
      return new Response(error_script);
    }

    const user_resp = await db.select().from(users).where(eq(users.key, key));

    if (user_resp.length == 0) {
      return new Response(error_script);
    }

    const user_data = user_resp[0];

    if (user_data.project_id != project_data.project_id) {
      return new Response(error_script);
    }

    if (user_data.key_expires) {
      if (user_data.key_expires < new Date()) {
        return new Response(kick_script("upioguard", "Key has expired", false, ""));
      }
    }




  }

}