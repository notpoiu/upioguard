import { pgTable, text, timestamp, numeric, pgEnum, boolean, integer } from "drizzle-orm/pg-core";

export const type = pgEnum("type", ["free-paywall","paid"]);
export const key_type = pgEnum("key_type", ["temporary","permanent","checkpoint"]);

export const project = pgTable("project", {
  project_id: text("project_id").primaryKey().notNull(),
  
  name: text("name").notNull(),
  description: text("description").notNull(),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
  author_id: text("author_id").notNull(),
  total_executions: numeric("total_executions").notNull().default("0"),
  project_type: type("project_type").notNull().default("paid"),

  github_owner: text("github_owner").notNull(),
  github_repo: text("github_repo").notNull(),
  github_path: text("github_path").notNull(),
  github_token: text("github_token").notNull(),

  
  discord_webhook: text("discord_webhook"),
  discord_link: text("discord_link"),
});


export interface Project {

  project_id: string;

  name: string;

  description: string;

  creation_timestamp: Date;

  author_id: string;

  total_executions: string;

  project_type: "free-paywall" | "paid";

  github_owner: string;

  github_repo: string;

  github_path: string;
  github_token: string;

  discord_link: string | null | undefined;
  discord_webhook: string | null | undefined;

}

export const admins = pgTable("admins", {
  discord_id: text("discord_id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const project_admins = pgTable("project_admins", {
  discord_id: text("discord_id").primaryKey().notNull(),
  project_id: text("project_id").notNull(),
});

export const users = pgTable("users", {
  project_id: text("project_id").primaryKey().default("").notNull(),
  discord_id: text("discord_id").notNull(),
  username: text("name").notNull(),
  note: text("note"),
  key: text("key").notNull(),
  key_expires: timestamp("key_expires"),
  key_type: key_type("key_type"),
  hwid: text("hwid"),
  executor: text("executor"),
});

export const project_executions = pgTable("project_executions", {
  discord_id: text("discord_id"),
  project_id: text("project_id").primaryKey().notNull(),
  execution_timestamp: timestamp("execution_timestamp").notNull().defaultNow(),
});

export type InsertAdmins = typeof admins.$inferInsert;
export type SelectAdmins = typeof admins.$inferSelect;

export type InsertProject = typeof project.$inferInsert;
export type SelectProject = typeof project.$inferSelect;

export type InsertProjectAdmin = typeof project_admins.$inferInsert;
export type SelectProjectAdmin = typeof project_admins.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertProjectExecution = typeof project_executions.$inferInsert;
export type SelectProjectExecution = typeof project_executions.$inferSelect;