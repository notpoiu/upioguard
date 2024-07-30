import { auth } from "@/auth";
import { db } from "@/db";
import { project_admins } from "@/db/schema";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";

export default async function Dashboard() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return notFound();
  }

  const is_admin = await db.select().from(project_admins).where(eq(project_admins.discord_id, session.user.id))

  if (is_admin.length === 0) {
    return notFound();
  }

  return (
    <main>
      {process.env.NODE_ENV === "development" && <h1>Dev mode</h1>}
      {process.env.IS_FIRST_TIME === "true" && <h1>Hey consider setting IS_FIRST_TIME to false in your .env</h1>}
      <h1>Dashboard</h1>

      
    </main>
  );
} 