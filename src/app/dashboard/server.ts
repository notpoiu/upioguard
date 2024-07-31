"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { project_admins, project, project_executions, project_api_keys, admins, ProjectApiKey } from "@/db/schema";
import { getRandomArbitrary, randomString } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

function generate_project_id() {
  return randomString(getRandomArbitrary(15,20));
}

async function validate_admin_account() {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  const admins_data = await db.select().from(admins).where(eq(admins.discord_id, session.user.id));
  if (admins_data.length == 0) {
    throw new Error("Unauthorized");
  }
}

async function validate_permissions(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_admin_account();

  const project_data = await db.select().from(project).where(eq(project.project_id, project_id));

  if (project_data.length == 0) {
    throw new Error("Project not found");
  }

  const project_admins_data = await db.select().from(project_admins).where(sql`${project_admins.project_id} = ${project_id} AND ${project_admins.discord_id} = ${session.user.id}`);
  if (project_admins_data.length == 0) {
    throw new Error("Unauthorized");
  }

  return project_data[0];
}

export async function add_project_admin(project_id: string) {
  const session = await auth();
  await validate_permissions(project_id);

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await db.insert(project_admins).values({
    discord_id: session.user.id,
    project_id: project_id,
  })
}

export async function get_api_keys_from_projects_owned_by_user() {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_admin_account();

  const project_data = await db.select().from(project_api_keys).where(eq(project_api_keys.creator_id, session.user.id));
  return project_data;
}

export async function delete_api_keys(api_key: ProjectApiKey[]) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  for (const key of api_key) {
    await db.delete(project_api_keys).where(sql`${project_api_keys.api_key} = ${key.api_key} AND ${project_api_keys.project_id} = ${key.project_id}`);
  }
}

export async function create_api_key(project_id: string, name: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  if (name == "" || project_id == "") {
    throw new Error("Missing required fields");
  }

  await validate_permissions(project_id);

  const api_key = "ugt_"+randomString(getRandomArbitrary(25,30));

  await db.insert(project_api_keys).values({
    project_id: project_id,
    name: name,
    api_key: api_key,
    creator_id: session.user.id,
  })

  return api_key;
}

export async function generate_project(name: string, description: string, type: "paid" | "free-paywall", discord_link: string, github_owner: string, github_repo: string, github_path: string, github_token: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_admin_account();

  const generated_project_id = generate_project_id();

  await db.insert(project_admins).values({
    discord_id: session.user.id,
    project_id: generated_project_id,
  })

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

  await validate_admin_account();

  const project_data = await db.select().from(project).where(eq(project.author_id, session.user.id));
  return project_data;
}

export async function get_project(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_permissions(project_id);

  const project_data = await db.select().from(project).where(sql`${project.project_id} = ${project_id}`);
  return project_data[0];
}

export async function get_project_executions(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_permissions(project_id);

  const project_data = await db.select().from(project_executions).where(sql`${project_executions.project_id} = ${project_id}`);
  return project_data;
}

export async function fetch_project_executions(project_id: string) {
  const session = await auth();

  if (session?.user?.id === undefined) {
    throw new Error("Unauthorized");
  }

  await validate_permissions(project_id);

  const project_data = await db.select().from(project_executions).where(sql`${project_executions.project_id} = ${project_id}`);

  let organized_data: any[] = [];
  for (const execution of project_data) {
    const date = execution.execution_timestamp.toISOString().split("T")[0];
    if (!organized_data.find((data) => data.date === date)) {
      organized_data.push({ date: date, desktop: 0, mobile: 0 });
    }

    if (execution.execution_type === "desktop") {
      organized_data.find((data) => data.date === date).desktop += 1;
    } else if (execution.execution_type === "mobile") {
      organized_data.find((data) => data.date === date).mobile += 1;
    }
  }

  return organized_data;
}