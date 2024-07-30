import { auth } from "@/auth";
import GreetingDashText from "./components/greeting";
import { db } from "@/db";
import { project, project_admins } from "@/db/schema";
import { eq } from "drizzle-orm";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@radix-ui/react-dropdown-menu";
import ProjectCreationStepper from "./components/project-stepper";
import { headers } from "next/headers";
import CopyPasteButton from "./components/copy_component";



export default async function Dashboard() {
  const headersList = headers();
  const session = await auth();

  const project_data = await db.select().from(project).where(eq(project.author_id, session?.user?.id as string));
  const is_project_initialized = project_data.length > 0;
  
  return (
    <main>
      
      <GreetingDashText name={session?.user?.name ?? "Anonymous"} />
      <p>Welcome to upioguard dashboard, you are an administrator of a project.</p>
      
      {!is_project_initialized && (
        <ProjectCreationStepper />
      )}

      {is_project_initialized && (
        <>
          <div className="relative bg-secondary text-primary rounded-md p-3 my-2 min-h-[5rem]">
            <CopyPasteButton text={`loadstring(game:HttpGet("${process.env.NODE_ENV == "production" ? "https://" : "http://"}${headersList.get("host")}/api/script"))()`} className="absolute top-0 right-0 mt-2 mr-2" />
            <span className="max-w-[30rem] text-wrap">loadstring(game:HttpGet(&quot;{process.env.NODE_ENV == "production" ? "https://" : "http://"}{headersList.get("host")}/api/script&quot;))()</span>
          </div>
        </>
      )}
    </main>
  );
} 