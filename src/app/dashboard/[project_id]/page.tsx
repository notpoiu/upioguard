import { auth } from "@/auth";
import GreetingDashText from "./components/greeting";
import { format } from "date-fns"

export default async function Dashboard({params}: {params: {project_id: string}}) {
  const session = await auth();
  return (
    <main>
      <GreetingDashText name={session?.user?.name ?? "Anonymous"} managing={true} />
    </main>
  );
} 