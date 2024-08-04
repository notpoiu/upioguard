import { auth } from "@/auth";
import { db } from "@/db";
import { project_admins, admins, project, users } from "@/db/schema";
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

  const does_exist = await db
    .select()
    .from(admins)
    .where(eq(admins.discord_id, session.user.id));

  if (does_exist.length === 0) {
    return notFound();
  }

  return children;
}
