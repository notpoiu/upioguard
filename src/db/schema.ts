import { pgTable, serial, text, timestamp, numeric, pgEnum, boolean } from "drizzle-orm/pg-core";

export const type = pgEnum("type", ["free","free-paywall","paid"]);

export const project = pgTable("project", {
  name: text("name").notNull(),
  description: text("description").notNull(),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
  author_id: text("author_id").notNull(),
  total_executions: numeric("total_executions").notNull().default("0"),
  project_type: type("project_type").notNull().default("paid"),
});

export const project_admins = pgTable("project_admins", {
  discord_id: text("discord_id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  discord_id: text("discord_id"),
  username: text("name").notNull(),
  note: text("note"),
  key: text("key").notNull(),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
});

export const project_executions = pgTable("project_executions", {
  user_id: serial("user_id"),
  execution_timestamp: timestamp("execution_timestamp").notNull().defaultNow(),
});

export type InsertProject = typeof project.$inferInsert;
export type SelectProject = typeof project.$inferSelect;

export type InsertProjectAdmin = typeof project_admins.$inferInsert;
export type SelectProjectAdmin = typeof project_admins.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertProjectExecution = typeof project_executions.$inferInsert;
export type SelectProjectExecution = typeof project_executions.$inferSelect;