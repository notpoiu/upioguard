import { auth } from "@/auth";
import GreetingDashText from "./components/greeting";
import { headers } from "next/headers";
import CopyPasteButton from "./components/copy_component";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { get_project, get_project_executions } from "../server";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns"
import { Button } from "@/components/ui/button";

export default async function Dashboard({params}: {params: {project_id: string}}) {
  const headersList = headers();
  const session = await auth();

  const project_data = await get_project(params.project_id);
  const executions_query = await get_project_executions(params.project_id);
  

  return (
    <main>
      <GreetingDashText name={session?.user?.name ?? "Anonymous"} />
      <p>You are managing, <span className="font-bold">{project_data.name ?? "Unknown"}</span>. {project_data.project_type == "paid" ? "This script is paid." : "This script is freemium."} Created the <span className="font-bold">{format(project_data.creation_timestamp, "PPP")}</span>.
      </p>

      <Card className="w-[300px] mt-5">
        <CardHeader>
          <CardTitle>Script Executions</CardTitle>
          <CardDescription>{executions_query.length} executions</CardDescription>
        </CardHeader>
      </Card>
      

    </main>
  );
} 