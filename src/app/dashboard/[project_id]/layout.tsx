import { auth } from "@/auth";
import Navbar from "@/app/dashboard/[project_id]/components/navbar";
import { db } from "@/db";
import { project_admins, admins, project } from "@/db/schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { PageContainer } from "@/components/ui/page-container";
import ProjectDataProvider from "./components/project_data_provider";

export const metadata: Metadata = {
  title: "upioguard | dashboard",
  description: "dashboard to manage upioguard",
};

export default async function DashLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { project_id: string };
}>) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return notFound();
  }

  const is_admin = await db.select().from(project_admins).where(sql`${project_admins.discord_id} = ${session.user.id} AND ${project_admins.project_id} = ${params.project_id}`);

  if (is_admin.length === 0) {
    return notFound();
  }

  return (
    <div className="flex flex-row max-sm:flex-col overflow-x-hidden">
      <ProjectDataProvider project_id={params.project_id}>
        <Navbar user={session?.user} project_id={params.project_id} />
        <PageContainer className="justify-start flex-col">
          {children}
        </PageContainer>
      </ProjectDataProvider>
    </div>
  );
}
