import { auth } from "@/auth";
import { db } from "@/db";
import { project_admins, admins, project } from "@/db/schema";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";

export const metadata: Metadata = {
  title: "upioguard | dashboard",
  description: "dashboard to manage upioguard",
};

export default async function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return notFound();
  }

  const is_admin = await db.select().from(project_admins).where(sql`${project_admins.discord_id} = ${session.user.id}`);

  if (is_admin.length === 0) {
    return notFound();
  }

  return children;
}
