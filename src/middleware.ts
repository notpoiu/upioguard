import { auth } from "@/auth";
import { url } from "inspector";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import path from "path";

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

    return NextResponse.rewrite(new URL(`/api/script/initial/${script_id}`, request.url));
  }
}