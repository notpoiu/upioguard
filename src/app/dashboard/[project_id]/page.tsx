import { auth } from "@/auth";
import GreetingDashText from "./components/greeting";
import HowToExecute from "./components/howtoexecute";

export default async function Dashboard({params}: {params: {project_id: string}}) {
  const session = await auth();
  return (
    <main>
      <GreetingDashText name={session?.user?.name ?? "Anonymous"} managing={true} />

      <HowToExecute project_id={params.project_id} />

    </main>
  );
} 