// TODO: rewrite this api route

import { db } from "@/db";
import { project, project_executions, users } from "@/db/schema";
import { kick_script } from "@/lib/luau_utils";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm/expressions";
import { Octokit } from "@octokit/rest";

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

async function collect_analytics(project_id: string,discord_id?: string | null, webhook_url?: string | null, webhook_data?: any | null) {
  try {
    if (webhook_url && webhook_url.trim() != "") {
      const response = await fetch(webhook_url, {
        method: "POST",
        body: JSON.stringify({
          "content": null,
          "embeds": [
            {
              "title": `${webhook_data.username} has ran script successsfully`,
              "color": 6291288,
              "fields": [
                {
                  "name": "Roblox Info",
                  "value": "```json\n{\n  \"username\": \"" + webhook_data.username + "\",\n  \"userid\": \"" + webhook_data.rbxluserid + "\",\n  \"placeid\": \"" + webhook_data.rbxlplaceid + "\",\n  \"jobid\": \"" + webhook_data.rbxljobid + "\",\n  \"game_name\": \"" + webhook_data.rbxlgamename + "\"\n}\n```",
                  "inline": true
                },
                {
                  "name": "Roblox Links",
                  "value": "[Join in roblox](https://externalrobloxjoiner.glitch.me/join?placeId=" + encodeURIComponent(webhook_data.rbxlplaceid) + "&jobId=" + encodeURIComponent(webhook_data.rbxljobid) + ")\n[View roblox profile](https://www.roblox.com/users/" + encodeURIComponent(webhook_data.userid) + "/profile)\n[Roblox experience link](https://www.roblox.com/games/" + encodeURIComponent(webhook_data.rbxlplaceid) + "/" + encodeURIComponent(webhook_data.rbxlgamename) + ")",
                  "inline": true
                },
                {
                  "name": "Request Data",
                  "value": "```json\n{\n  \"fingerprint\": \"" + webhook_data.hwid + "\",\n  \"executor\": \"" + webhook_data.executor + "\",\n  \"key\": \"" + webhook_data.key + "\",\n  \"is_premium\": " + webhook_data.is_premium + "\n  \"is_mobile\": " + webhook_data.is_mobile + "\n}\n\n```"
                },
                {
                  "name": "Discord Data",
                  "value": "<@" + webhook_data.userid + "> (" + webhook_data.username + " - " + webhook_data.userid + ")",
                  "inline": true
                }
              ]
            }
          ],
          "attachments": []
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        console.log("Failed to send webhook");
      }
    }
  } catch (error) {
    console.error("Failed to send webhook, error: ", error," webhook_url: ", webhook_url);
  }

  try {
    await db.insert(project_executions).values({
      discord_id: discord_id,
      project_id: project_id,
      execution_type: (webhook_data.is_mobile == "true") ? "mobile" : "desktop"
    });
  } catch (error) {
    console.error("Failed to insert project execution, error: ", error, " dump: ", JSON.stringify({
      discord_id: discord_id,
      project_id: project_id,
      execution_type: (webhook_data.is_mobile == "true") ? "mobile" : "desktop"
    }));
  }
}

function validate_header(header_key: string, headers_dict: any) {

  if (!headers_dict[header_key]) {
    return false;
  }

  const header_value = headers_dict[header_key];
  if (header_value.trim() == "not found" || header_value.trim() == "") {
    return false;
  }

  return true;
}

const headers_in_use = [
  "upioguard-key",
  "upioguard-rbxlusername",
  "upioguard-rbxlplaceid",
  "upioguard-rbxljobid",
  "upioguard-rbxlgamename",
  "upioguard-executor",
  "upioguard-rbxluserid",
  "upioguard-ismobile"
]

export async function GET(request: NextRequest, {params}: {params: {script_id: string}}) {
  const headers_dict = Object.fromEntries(request.headers.entries());
  const fingerprint = get_hwid(request.headers);

  // im sorry
  let {
    [headers_in_use[0]]: key,
    [headers_in_use[1]]: username,
    [headers_in_use[2]]: placeid,
    [headers_in_use[3]]: jobid,
    [headers_in_use[4]]: gamename,
    [headers_in_use[5]]: executor,
    [headers_in_use[6]]: userid,
    [headers_in_use[7]]: is_mobile,
  } = headers_dict;

  if (!fingerprint || fingerprint.trim() == "not found" || fingerprint.trim() == "" ) {
    return new Response(kick_script("upioguard", "Invalid executor", false, ""));
  }

  for (const header_key of headers_in_use) {
    if (!validate_header(header_key, headers_dict)) {
      return new Response(kick_script("upioguard", "Invalid request\nMissing: " + header_key, false, ""));
    }
  }

  // Get Project Data
  const project_resp = await db.select().from(project).where(eq(project.project_id, params.script_id));

  if (project_resp.length == 0) {
    return new Response(kick_script("upioguard", "Invalid script provided", false, ""));
  }

  const project_data = project_resp[0];

  const octokit = new Octokit({
    auth: project_data.github_token,
  });

  // handle paid projects (im sorry for the spaghetti code i just want to get a prototype done)
  if (project_data.project_type == "paid") {
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
      await db.update(users).set({ hwid: fingerprint, executor: executor }).where(eq(users.key, key));
    } else {
      if (user_data.hwid != fingerprint) {
        return new Response(error_script);
      }
    }

    // Analytics
    await collect_analytics(project_data.project_id, user_data.discord_id, project_data.discord_webhook, {
      username: user_data.username,
      userid: user_data.discord_id,
      hwid: fingerprint,
      script_name: project_data.name,
      is_premium: (user_data.key_expires && user_data.key_type != "permanent") ? false : true,
      expiry: user_data.key_expires ? `os.time() + ${(user_data.key_expires.getTime() - new Date().getTime()) / 1000}` : "nil",
      rbxlusername: username,
      rbxluserid: userid,
      rbxlplaceid: placeid,
      rbxljobid: jobid,
      rbxlgamename: gamename,
      executor: executor,
      is_mobile: is_mobile,
    });

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
      await collect_analytics(project_data.project_id, user_data.discord_id, project_data.discord_webhook, {
        username: data.username,
        userid: data.userid,
        hwid: fingerprint,
        script_name: project_data.name,
        is_premium: data.is_premium,
        expiry: data.expiry,
        rbxlusername: username,
        rbxlplaceid: placeid,
        rbxljobid: jobid,
        rbxlgamename: gamename,
        rbxluserid: userid,
        executor: executor,
        ismobile: is_mobile,
      });
    } else {
      await collect_analytics(project_data.project_id, null, project_data.discord_webhook, {
        username: "",
        userid: "",
        hwid: fingerprint,
        script_name: project_data.name,
        is_premium: false,
        expiry: "nil",
        rbxlusername: username,
        rbxluserid: userid,
        rbxlplaceid: placeid,
        rbxljobid: jobid,
        rbxlgamename: gamename,
        executor: executor,
        is_mobile: is_mobile,
      });
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