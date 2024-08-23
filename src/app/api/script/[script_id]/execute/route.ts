import { db } from "@/db";
import { banned_users, checkpoints, project_executions, users } from "@/db/schema";
import { kick_script } from "@/lib/luau_utils";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm/expressions";
import { Octokit } from "@octokit/rest";
import { sql } from "drizzle-orm";
import { create_key_helper_key } from "@/lib/key_utils";

// @ts-ignore
import { minify } from 'luamin';

import path from "path";
import fs from "fs";

function get_hwid(headers: Headers) {
  let fingerprint = "not found";

  if (headers !== undefined && headers instanceof Headers) {
    headers.forEach((value: string, name: string) => {
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
              "title": `${webhook_data.rbxlusername} has run ${webhook_data.script_name} successsfully`,
              "color": 6291288,
              "fields": [
                {
                  "name": "Roblox Info",
                  "value": "```json\n{\n  \"username\": \"" + webhook_data.rbxlusername + "\",\n  \"userid\": \"" + webhook_data.rbxluserid + "\",\n  \"placeid\": \"" + webhook_data.rbxlplaceid + "\",\n  \"jobid\": \"" + webhook_data.rbxljobid + "\",\n  \"game_name\": \"" + webhook_data.rbxlgamename + "\"\n}\n```",
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

async function ban_analytics(project_id: string,discord_id?: string | null, webhook_url?: string | null, webhook_data?: any | null) {
  try {
    if (webhook_url && webhook_url.trim() != "") {
      const response = await fetch(webhook_url, {
        method: "POST",
        body: JSON.stringify({
          "content": null,
          "embeds": [
            {
              "title": `${webhook_data.rbxlusername} tried to run ${webhook_data.script_name} but was blacklisted`,
              "color": 16734296,
              "fields": [
                {
                  "name": "Roblox Info",
                  "value": "```json\n{\n  \"username\": \"" + webhook_data.rbxlusername + "\",\n  \"userid\": \"" + webhook_data.rbxluserid + "\",\n  \"placeid\": \"" + webhook_data.rbxlplaceid + "\",\n  \"jobid\": \"" + webhook_data.rbxljobid + "\",\n  \"game_name\": \"" + webhook_data.rbxlgamename + "\"\n}\n```",
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

function validate_param(param_key: string, url_params: any) {
  let param_value = url_params[param_key];

  if (param_value == undefined || param_value == null) {
    return false;
  }

  param_value = param_value.trim();

  if (param_value == "not found" || param_value == "") {
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

async function fetch_script(octokit: Octokit, project_data: any, user_data: any, fingerprint: string) {
  const file_path = path.join(process.cwd(), 'scripts', 'script_response.lua');
  let response_script = fs.readFileSync(file_path, "utf8");

  const is_discord_enabled = project_data.discord_link != null && project_data.discord_link.trim() != "";
  const discord_link = project_data.discord_link ?? "";

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

    let returned_script_data_content = content;
    try {
      returned_script_data_content = minify(content, {
        RenameGlobals: true,
      });
    } catch (error) {
      console.log("Failed to minify: ", error);
    }

    response_script = response_script.replaceAll("${returned_content}", returned_script_data_content);
    response_script = response_script.replaceAll("${user_data.username}", user_data.username.replaceAll('"', '\\"'));
    response_script = response_script.replaceAll("${user_data.discord_id}", user_data.discord_id);
    response_script = response_script.replaceAll("${user_data.note}", user_data.note?.replaceAll('"', '\\"'));
    response_script = response_script.replaceAll("${fingerprint}", fingerprint);
    response_script = response_script.replaceAll("${project_data.name}", project_data.name);
    response_script = response_script.replaceAll("${user_data.expiry}", user_data.expiry ?? "nil");
    response_script = response_script.replaceAll("${user_data.is_premium}", user_data.is_premium);

    return new Response(response_script);
  } catch (error) {
    return new Response(kick_script("upioguard", "Failed to fetch script from GitHub", is_discord_enabled, discord_link));
  }
}

export async function GET(request: NextRequest, {params}: {params: {script_id: string}}) {
  let headers_dict = Object.fromEntries(request.headers.entries());
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

  let check_url_params = false;
  for (const header_key of headers_in_use) {
    if (!validate_header(header_key, headers_dict) && headers_dict[header_key] != fingerprint) {
      check_url_params = true;
      break;
    }
  }

  if (check_url_params) {
    const url_params = request.nextUrl.searchParams;

    for (const header_key of headers_in_use) {
      if (!validate_param(header_key, JSON.parse(url_params.get("execution_data") ?? "{}"))) {
        return new Response(kick_script("upioguard", "Invalid request\nMissing: " + header_key, false, ""));
      }
    }

    const data = JSON.parse(url_params.get("execution_data") ?? "{}");
    key = data["upioguard-key"] ?? "";
    username = data["upioguard-rbxlusername"] ?? "username was not found";
    placeid = data["upioguard-rbxlplaceid"] ?? "0";
    jobid = data["upioguard-rbxljobid"] ?? "0";
    gamename = data["upioguard-rbxlgamename"] ?? "Game Name was not found";
    executor = data["upioguard-executor"] ?? "unknown";
    userid = data["upioguard-rbxluserid"] ?? "0";
    is_mobile = data["upioguard-ismobile"] ?? "false";
  }

  // Get Project Data
  const KeyHelper = await create_key_helper_key(params.script_id, key ?? "");

  if (!KeyHelper.is_project_valid()) {
    return new Response(kick_script("upioguard", "Invalid script executed", false, ""));
  }

  const project_data = KeyHelper.project_data;

  const octokit = new Octokit({
    auth: project_data.github_token,
  });

  const is_discord_enabled = project_data.discord_link != null && project_data.discord_link.trim() != "";
  const discord_link = project_data.discord_link ?? "";

  const banned_users_resp = await db.select().from(banned_users).where(sql`${banned_users.project_id} = ${project_data.project_id} AND ${banned_users.hwid} = ${fingerprint}`);

  if (banned_users_resp.length > 0) {
    const is_perm_ban = (banned_users_resp[0].expires === null || banned_users_resp[0].expires === undefined);
    if (is_perm_ban) {
      const user_resp = await db.select().from(users).where(eq(users.key, key));
      const user_data = user_resp[0];
  
      await ban_analytics(project_data.project_id, user_data.discord_id, project_data.discord_webhook, {
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
        key: key,
        is_mobile: is_mobile == "true" ? true : false,
      });
      return new Response(kick_script("upioguard", `You have been permanently blacklisted from this script
  Reason: ${banned_users_resp[0].reason ?? "No reason provided"}`, is_discord_enabled, discord_link));
    }

    const is_temp_ban = (banned_users_resp[0].expires !== null && banned_users_resp[0].expires !== undefined);
    if (is_temp_ban) {
      const expires = banned_users_resp[0].expires ?? new Date(Date.now() + 5000 * 60 * 60 * 24);
      const now = new Date();
  
      if (expires > now) {
        const user_resp = await db.select().from(users).where(eq(users.key, key));
        const user_data = user_resp[0];
  
        await ban_analytics(project_data.project_id, user_data.discord_id, project_data.discord_webhook, {
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
          key: key,
          is_mobile: is_mobile == "true" ? true : false,
        });
  
        return new Response(kick_script("upioguard", `You have been temporarily blacklisted from this script
  Unavailable until: ${expires.toLocaleString()} at UTC ${expires.getTimezoneOffset()}
  
  Reason: ${banned_users_resp[0].reason ?? "No reason provided"}`, is_discord_enabled, discord_link));
      } else {
        await db.delete(banned_users).where(sql`${banned_users.project_id} = ${project_data.project_id} AND ${banned_users.hwid} = ${fingerprint}`);
      }
    }
  }

  if (project_data.project_type == "paid") {
    const error_script = kick_script("upioguard", "Invalid key provided", is_discord_enabled, discord_link);

    if (!key || key.trim() == "undefined") {
      return new Response(error_script);
    }

    const [validated_key, key_type] = KeyHelper.get_key();

    if (!KeyHelper.is_key_valid()) {
      return new Response(error_script);
    }

    if (KeyHelper.get_general_expiration() && key_type != "permanent") {
      if (KeyHelper.is_temp_key_expired()) {
        return new Response(kick_script("upioguard", "Key has expired", is_discord_enabled, discord_link));
      }
    }

    const user_data = KeyHelper.key_data;

    if (!user_data.hwid || !user_data.executor) {
      await db.update(users).set({ hwid: fingerprint, executor: executor }).where(sql`${users.key} = ${validated_key} AND ${users.project_id} = ${project_data.project_id}`);
    } else if (user_data.hwid != fingerprint) {
      return new Response(error_script);
    }

    // Analytics
    await collect_analytics(project_data.project_id, user_data.discord_id, project_data.discord_webhook, {
      username: user_data.username,
      userid: user_data.discord_id,
      hwid: fingerprint,
      script_name: project_data.name,
      is_premium: true,
      expiry: KeyHelper.get_general_expiration() == null ? "nil" : `os.time() + ${((KeyHelper.get_general_expiration() as Date).getTime() - new Date().getTime()) / 1000}`,
      rbxlusername: username,
      rbxluserid: userid,
      rbxlplaceid: placeid,
      rbxljobid: jobid,
      rbxlgamename: gamename,
      executor: executor,
      key: key,
      is_mobile: is_mobile == "true" ? true : false,
    });

    return await fetch_script(octokit, project_data, {
      username: user_data.username,
      discord_id: user_data.discord_id ?? "",
      note: user_data.note ?? "",
      is_premium: true,
      expiry: KeyHelper.get_general_expiration() == null ? "nil" : `os.time() + ${((KeyHelper.get_general_expiration() as Date).getTime() - new Date().getTime()) / 1000}`,
    }, fingerprint);
  }

  // handle free projects
  if (project_data.project_type == "free-paywall") {
    const error_script = kick_script("upioguard", "Invalid key provided", is_discord_enabled, discord_link);

    let data = {
      username: "",
      userid: "",
      note: "",
      script_name: project_data.name,
      is_premium: false,
      expiry: "nil",
    }

    if (key && key.trim() != "undefined") {
      if (!KeyHelper.is_key_valid()) {
        return new Response(error_script);
      }

      const user_data = KeyHelper.key_data;
      const [validated_key, key_type] = KeyHelper.get_key();
      
      data.username = user_data.username;
      data.userid = user_data.discord_id ?? "";
      data.note = user_data.note ?? "";
      data.is_premium = true;
      data.expiry = KeyHelper.get_general_expiration() == null ? "nil" : `os.time() + ${((KeyHelper.get_general_expiration() as Date).getTime() - new Date().getTime()) / 1000}`;

      if (user_data.project_id != project_data.project_id) {
        data.is_premium = false;
      }

      if (key_type == "temporary" && KeyHelper.is_temp_key_expired()) {
        data.is_premium = false;
      }

      
      if (key_type == "checkpoint") {
        const checkpoints_db_response = await db.select().from(checkpoints).where(eq(checkpoints.project_id, project_data.project_id));
        const { is_premium } = await KeyHelper.handleCheckpointKey(project_data, checkpoints_db_response);
        data.is_premium = is_premium;
      }

      if (!user_data.hwid || !user_data.executor) {
        await db.update(users).set({ hwid: fingerprint, executor: executor }).where(eq(users.key, key));
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
        ismobile: is_mobile == "true" ? true : false,
        key: key,
      });

      return await fetch_script(octokit, project_data, {
        username: user_data.username,
        discord_id: user_data.discord_id ?? "",
        note: user_data.note ?? "",
        is_premium: data.is_premium,
        expiry: KeyHelper.get_general_expiration() == null ? "nil" : `os.time() + ${((KeyHelper.get_general_expiration() as Date).getTime() - new Date().getTime()) / 1000}`,
      }, fingerprint);
    }
    
    return await fetch_script(octokit, project_data, {
      username: data.username,
      discord_id: data.userid ?? "",
      note: data.note ?? "",
      is_premium: data.is_premium,
      expiry: KeyHelper.get_general_expiration() == null ? "nil" : `os.time() + ${((KeyHelper.get_general_expiration() as Date).getTime() - new Date().getTime()) / 1000}`,
    }, fingerprint);
  }
}