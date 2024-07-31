import { auth } from "@/auth";
import { url } from "inspector";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import path from "path";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { project } from "./db/schema";
import { notFound } from "next/navigation";

function get_pathname(request: NextApiRequest) {
  const url_parts = request.url?.split("/");
  url_parts?.splice(0, 3);
  let url_path = "/"+url_parts?.join("/");

  return url_path;
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

    return NextResponse.rewrite(new URL(`/api/script/initial/${script_id}`, request.url));
  }
}