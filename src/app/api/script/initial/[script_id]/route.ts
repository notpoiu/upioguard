import path from "path";
import fs from "fs";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params}: { params: { script_id: string } }) {
  const file_path = path.join(process.cwd(), 'scripts', 'redirect_initial.lua');
  const initial_script = fs.readFileSync(file_path, "utf8");
  
  let script = initial_script.replaceAll("${origin}", request.nextUrl.origin);
  script = script.replaceAll("${script_id}", params.script_id);

  return new Response(script, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}