// TODO: rewrite this api route

import { db } from "@/db";
import { project, project_executions, users } from "@/db/schema";
import { kick_script } from "@/lib/luau_utils";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm/expressions";
import { Octokit } from "@octokit/rest";
import { get_project } from "@/app/dashboard/[project_id]/server";
import { sql } from "drizzle-orm";

/*

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});
*/

function get_hwid(headersList: Headers) {
  let fingerprint = "not found";

  if (headersList !== undefined && headersList instanceof Headers) {
      headersList.forEach((value: string, name: string) => {
          const val_name = name.toLocaleLowerCase();

          const is_fingerprint = val_name.includes('fingerprint') || val_name.includes('hwid') || val_name.includes("identifier");
          const value_exists = value != undefined && value != null && value != "";

          if (is_fingerprint && value_exists) {
              fingerprint = value;
          }
      });
  }
  
  return fingerprint;
}

async function collect_analytics(project_id: string,discord_id?: string | null) {
  await db.insert(project_executions).values({ discord_id: discord_id, project_id: project_id });
}

export async function GET(request: NextRequest, {params}: {params: {project_id: string}}) {
  // Fetch HWID
  const fingerprint = get_hwid(request.headers);

  if (!fingerprint || fingerprint.trim() == "not found" || fingerprint.trim() == "") {
    return new Response(kick_script("upioguard", "Invalid executor", false, ""));
  }

  // Get Project Data
  const project_resp = await db.select().from(project).where(sql`${project.project_id} = ${params.project_id}`);

  if (project_resp.length == 0) {
    return new Response(kick_script("upioguard", "Invalid script provided", false, ""));
  }

  const project_data = project_resp[0];

  const octokit = new Octokit({
    auth: project_data.github_token,
  });

  // handle paid projects (im sorry for the spaghetti code i just want to get a prototype done)
  if (project_data.project_type == "paid") {
    const key = request.headers.get("upioguard-key");

    const is_discord_enabled = project_data.discord_link != null && project_data.discord_link.trim() != "";
    const discord_link = project_data.discord_link ?? "";

    const error_script = kick_script("upioguard", "Invalid key provided", is_discord_enabled, discord_link);

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

    if (user_data.key_expires && user_data.key_type != "permanent") {
      if (user_data.key_expires < new Date()) {
        return new Response(kick_script("upioguard", "Key has expired", is_discord_enabled, discord_link));
      }
    }

    if (!user_data.hwid) {
      await db.update(users).set({ hwid: fingerprint }).where(eq(users.key, key));
    } else {
      if (user_data.hwid != fingerprint) {
        return new Response(error_script);
      }
    }

    // Analytics
    await collect_analytics(project_data.project_id, user_data.discord_id);

    try {
      const response = await octokit.repos.getContent({
        owner: project_data.github_owner,
        repo: project_data.github_repo,
        path: project_data.github_path,
      });

      if (response.status !== 200) {
          return new Response(kick_script("upioguard", "Failed to fetch script from GitHub", is_discord_enabled, discord_link));
      }
  
      // @ts-ignore
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

      return new Response(`assert(getgenv, "getgenv not found, ${project_data.name} could not be run.")
getgenv().upioguard = {
  username = "${user_data.username.replaceAll('"', '\\"')}",
  userid = "${user_data.discord_id}",
  note = "${user_data.note?.replaceAll('"', '\\"')}",
  hwid = "${fingerprint}",
  script_name = "${project_data.name}",
${user_data.key_expires ? `  expiry = os.time() + ${(user_data.key_expires.getTime() - new Date().getTime()) / 1000},` : ""}
  is_premium = true,
}

${content}`);
    } catch (error) {
      return new Response(kick_script("upioguard", "Failed to fetch script from GitHub", is_discord_enabled, discord_link));
    }
  }

  // handle free projects
  if (project_data.project_type == "free-paywall") {
    const key = request.headers.get("user-upioguard-key");

    const is_discord_enabled = project_data.discord_link != null;
    const discord_link = project_data.discord_link ?? "";

    const error_script = kick_script("upioguard", "Invalid key provided", is_discord_enabled, discord_link);

    let data = {
      username: "",
      userid: "",
      note: "",
      script_name: project_data.name,
      is_premium: false,
      expiry: "nil",
    }

    if (key) {
      const user_resp = await db.select().from(users).where(eq(users.key, key));

      if (user_resp.length == 0) {
        return new Response(error_script);
      }

      const user_data = user_resp[0];
      
      data.username = user_data.username;
      data.userid = user_data.discord_id ?? "";
      data.note = user_data.note ?? "";
      data.is_premium = true;
      data.expiry = user_data.key_expires ? `os.time() + ${(user_data.key_expires.getTime() - new Date().getTime()) / 1000}` : "nil";
      
      if (user_resp[0].project_id != project_data.project_id) {
        data.is_premium = false;
      }

      if (user_data.key_expires && user_data.key_type != "permanent") {
        if (user_data.key_expires < new Date()) {
          data.is_premium = false;
        }
      }
      
      if (!user_data.hwid) {
        await db.update(users).set({ hwid: fingerprint }).where(eq(users.key, key));
      } else {
        if (user_data.hwid != fingerprint) {
          data.is_premium = false;
          data.username = "";
          data.userid = "";
          data.note = "";
          data.expiry = "nil";
        }
      }

      // Analytics
      await collect_analytics(project_data.project_id, user_data.discord_id);
    }

    try {
      const response = await octokit.repos.getContent({
        owner: project_data.github_owner,
        repo: project_data.github_repo,
        path: project_data.github_path,
      });

      if (response.status !== 200) {
          return new Response(kick_script("upioguard", "Failed to fetch script from GitHub", is_discord_enabled, discord_link));
      }
  
      // @ts-ignore
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

      return new Response(`assert(getgenv, "getgenv not found, ${project_data.name} could not be run.")
getgenv().upioguard = {
  username = "${data.username.replaceAll('"', '\\"')}",
  userid = "${data.userid}",
  note = "${data.note.replaceAll('"', '\\"')}",
  hwid = "${fingerprint}",
  script_name = "${project_data.name}",
  is_premium = ${data.is_premium},
  expiry = ${data.expiry},
}

${content}`);
    } catch (error) {
      return new Response(kick_script("upioguard", "Failed to fetch script from GitHub", is_discord_enabled, discord_link));
    }
  }
}