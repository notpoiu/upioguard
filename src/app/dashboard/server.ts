"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generate_project(name: string, description: string, type: "paid" | "free-paywall", discord_link: string, github_owner: string, github_repo: string, github_path: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await db.insert(project).values({
    name: name,
    description: description,
    author_id: session.user.id,
    github_owner: github_owner,
    github_repo: github_repo,
    github_path: github_path,
    discord_link: discord_link,
    project_type: type,
  })

  const project_data = await db.select().from(project).where(eq(project.author_id, session.user.id));
  return project_data[0];
}

export async function get_project() {
  const project_data = await db.select().from(project);
  return project_data[0];
}