import path from "path";
import fs from "fs";

export async function GET(request: Request, { params}: { params: { script_id: string } }) {
  const file_path = path.join(process.cwd(), 'scripts', 'redirect_initial.lua');
  const initial_script = fs.readFileSync(file_path, "utf8");
  
  return new Response(initial_script.replaceAll("${script_id}", params.script_id), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}