import { auth } from "@/auth";
import ProjectCreationStepper from "./components/project-stepper";
import { get_projects_owned_by_user } from "./server";
import { PageContainer } from "@/components/ui/page-container";
import { User } from "next-auth";
import Project_Navbar from "./components/projects_navbar";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import GreetingDashText from "./[project_id]/components/greeting";
import BlurFade from "@/components/magicui/blur-fade";


export default async function Dashboard() {
  const session = await auth();

  const project_data = await get_projects_owned_by_user();
  const is_project_initialized = project_data.length > 0;
  
  if (is_project_initialized) {
    return (
      <div className="flex flex-row max-sm:flex-col overflow-x-hidden">
        <Project_Navbar user={session?.user as User} projects={project_data} />
        <PageContainer className="justify-start flex-col">
          
          <main>
            <GreetingDashText name={session?.user?.name ?? "Anonymous"} />
            <p>Welcome back to the upioguard dashboard, made with ❤️ by <Link href="https://github.com/notpoiu" target="_blank" className="text-blue-400 underline">upio</Link>.</p>
            
            <p>You can manage the following projects:</p>

            <div className="flex flex-wrap gap-4 mt-5">
              {project_data.map((project, index) => (
                <BlurFade delay={0.25 * index} inView key={project.project_id}>                                
                  <Card key={project.project_id} className="w-[300px]">
                    <CardHeader>
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/dashboard/${project.project_id}`}>
                        <Button variant={"outline"}>Go to project</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </BlurFade>
              ))}

              <BlurFade delay={0.25 * project_data.length} inView>                                
                <Card className="w-[300px]">
                  <CardHeader>
                    <CardTitle>Create a new Script</CardTitle>
                    <CardDescription>Press the button below to start</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href="/dashboard/create">
                      <Button>Create Script</Button>
                    </Link>
                  </CardFooter>
                </Card>
              </BlurFade>
            </div>
          </main>
        </PageContainer>
      </div>
      
    )
  }

  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-3xl font-bold">Welcome {session?.user?.name ?? "Anonymous"}</h1>
      <p>Set up your first script</p>
      <ProjectCreationStepper is_first_time={true} />
    </main>
  );
} 