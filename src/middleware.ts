import { auth } from "@/auth";
import { url } from "inspector";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import path from "path";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { project, project_api_keys } from "./db/schema";
import { validate_permissions } from "./app/dashboard/server";
import { headers } from "next/headers";

function get_pathname(request: NextApiRequest) {
  return new URL(request.url ?? "https://google.com/").pathname;
}

export default async function middleware(request: NextApiRequest, response: NextApiResponse) {
  await auth(request, response);

  const pathname = get_pathname(request);

  if (pathname.startsWith("/scripts/loaders/")) {
    const script_id = pathname.split("/")[pathname.split("/").length - 1].replace(".lua", "").replace(".luau", "");

    const is_script = await db.select().from(project).where(eq(project.project_id, script_id));

    if (is_script.length < 1) {
      return NextResponse.rewrite(new URL(`/404`, request.url));
    }

    return NextResponse.rewrite(new URL(`/api/script/${script_id}/execute/initial_redirect_gen`, request.url));
  }

  if (pathname.match(/\/api\/script\/[a-zA-Z0-9]+\/manage/)) {
    const script_id = pathname.split("/").splice(3, 1)[0];
    
    let api_key = headers().get("api-key");

    if (api_key == undefined || api_key.trim() == "" || api_key == null) {
      try {
        await validate_permissions(script_id);
        return NextResponse.next();
      } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const resp_project_api_keys = await db.select().from(project_api_keys).where(eq(project_api_keys.api_key, api_key));
    const project_response = await db.select().from(project).where(eq(project.project_id, script_id));
    const api_key_data = resp_project_api_keys[0];
    const project_data = project_response[0];

    const is_permission_all = api_key_data.project_id == "all" && api_key_data.creator_id != project_data.author_id;

    if (api_key_data.project_id != script_id || is_permission_all) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }
}