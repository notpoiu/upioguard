import { auth } from "@/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { project, project_api_keys } from "./db/schema";
import { validate_permissions } from "./app/dashboard/server";
import { headers } from "next/headers";

function getPathname(request: NextApiRequest): string {
  const url = new URL(request.url);
  return url.pathname;
}

export default async function middleware(request: NextApiRequest, response: NextApiResponse) {
  await auth(request, response);

  const pathname = getPathname(request);

  if (pathname.startsWith("/scripts/loaders/")) {
    const scriptId = path.basename(pathname, path.extname(pathname));

    const isScript = await db.select().from(project).where(eq(project.project_id, scriptId));

    if (isScript.length < 1) {
      return NextResponse.rewrite(new URL(`/404`, `http://${request.headers.host}`));
    }

    return NextResponse.rewrite(new URL(`/api/script/${scriptId}/execute/initial_redirect_gen`, `http://${request.headers.host}`));
  }

  if (pathname.match(/\/api\/script\/[a-zA-Z0-9]+\/manage/)) {
    const scriptId = pathname.split("/")[3];

    const apiKey = headers().get("api-key");

    if (!apiKey || apiKey.trim() === "") {
      try {
        await validate_permissions(scriptId);
        return NextResponse.next();
      } catch (e) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const [apiKeyData, projectData] = await Promise.all([
      db.select().from(project_api_keys).where(eq(project_api_keys.api_key, apiKey)).then(res => res[0]),
      db.select().from(project).where(eq(project.project_id, scriptId)).then(res => res[0]),
    ]);

    if (!apiKeyData || !projectData || (apiKeyData.project_id !== scriptId && apiKeyData.project_id !== "all") || apiKeyData.creator_id !== projectData.author_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}
