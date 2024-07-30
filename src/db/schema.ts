import { pgTable, serial, text, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";

// Passwords are stored as SHA512 hashes with a salt (src/lib/password.ts)

export const type = pgEnum("type", ["free","free-paywall","paid"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
  author: serial("author").notNull(),
  total_executions: numeric("total_executions").notNull().default("0"),
  type: type("paid").notNull(),
});

export const project_admins = pgTable("project_admins", {
  discord_id: text("discord_id").primaryKey().notNull(),
  id: serial("id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discord_id: text("discord_id"),
  username: text("name").notNull(),
  note: text("note"),
  creation_timestamp: timestamp("created_at").notNull().defaultNow(),
});

export const project_executions = pgTable("project_executions", {
  project_id: serial("project_id").primaryKey().notNull(),
  user_id: serial("user_id"),
  execution_timestamp: timestamp("execution_timestamp").notNull().defaultNow(),
});


export type InsertProject = typeof projects.$inferInsert;
export type SelectProject = typeof projects.$inferSelect;

export type InsertProjectAdmin = typeof project_admins.$inferInsert;
export type SelectProjectAdmin = typeof project_admins.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export type InsertProjectExecution = typeof project_executions.$inferInsert;
export type SelectProjectExecution = typeof project_executions.$inferSelect;