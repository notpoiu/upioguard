import { auth } from "@/auth";
import ProjectCreationStepper from "../components/project-stepper";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CreateProject() {
  const session = await auth();
  
  return (
    <main className="flex flex-col items-center justify-center w-screen h-screen">
      <h1 className="text-3xl font-bold">Welcome {session?.user?.name ?? "Anonymous"}</h1>
      <p>Set up a script</p>
      <ProjectCreationStepper is_first_time={false} />

      <Link href="/dashboard" className="fixed bottom-0 mb-5">
        <Button variant={"outline"}>
          Go back to dashboard
        </Button>
      </Link>
    </main>
  );
}