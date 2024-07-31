"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project, project_executions } from "@/db/schema";
import { getRandomArbitrary, randomString } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

function generate_project_id() {
  return randomString(getRandomArbitrary(15,20));
}

export async function generate_project(name: string, description: string, type: "paid" | "free-paywall", discord_link: string, github_owner: string, github_repo: string, github_path: string, github_token: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  const generated_project_id = generate_project_id();

  await db.insert(project).values({
    name: name,
    project_id: generated_project_id,
    description: description,
    author_id: session.user.id,
    github_owner: github_owner,
    github_repo: github_repo,
    github_path: github_path,
    github_token: github_token,
    discord_link: discord_link,
    project_type: type,
  })

  return {
    name: name,
    project_id: generated_project_id,
    description: description,
    author_id: session.user.id,
    github_owner: github_owner,
    github_repo: github_repo,
    github_path: github_path,
    github_token: github_token,
    discord_link: discord_link,
    project_type: type,
  }
}

export async function get_projects_owned_by_user() {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  const project_data = await db.select().from(project).where(eq(project.author_id, session.user.id));
  return project_data;
}

export async function get_project(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  const project_data = await db.select().from(project).where(sql`${project.project_id} = ${project_id} AND ${project.author_id} = ${session.user.id}`);
  return project_data[0];
}

export async function get_project_executions(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  const project_data = await db.select().from(project_executions).where(sql`${project_executions.project_id} = ${project_id} AND ${project_executions.discord_id} = ${session.user.id}`);
  return project_data;
}