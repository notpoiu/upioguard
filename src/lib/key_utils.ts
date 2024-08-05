"use server";

import { db } from "@/db";
import { Key, project, Project, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// I coudnt work with the spaghetti code that i made so uh
export class KeyHelper {
  public key_data: Key = {
    key_expires: null,
    key_type: "checkpoint",
    discord_id: "",
    username: "",
    note: "",
    hwid: "",
    executor: "",
    checkpoints_finsihed: false,
    checkpoints_finished_at: null,
    checkpoint_index: "0",
    checkpoint_started_at: null,
    project_id: "",
    key: "",
  };
  public project_data: Project = {
    project_id: "",
    name: "",
    description: "",
    creation_timestamp: new Date(),
    author_id: "",
    linkvertise_key_duration: "",
    project_type: "free-paywall",
    minimum_checkpoint_switch_duration: "",
    github_owner: "",
    github_repo: "",
    github_path: "",
    github_token: "",
    discord_link: undefined,
    discord_webhook: undefined
  };

  public project_id: string = "";
  public key: string = "";

  public constructor(key: string, project_id: string) {
    this.project_id = project_id;
    this.key = key;
  }

  public init() {
    return this.internal_init(this.key, this.project_id);
  }

  // A wrapper for init, its just so it looks nicer
  public refresh() {
    return this.internal_init(this.key, this.project_id);
  }

  private async internal_init(key: string, project_id: string) {
    const db_response = await db.select().from(users).where(sql`${users.key} = ${key} AND ${users.project_id} = ${project_id}`);
    this.key_data = db_response[0];

    const project_response = await db.select().from(project).where(eq(users.project_id, project_id));
    this.project_data = project_response[0];
  }

  public get_key() {
    return [this.key_data.key, this.key_data.key_type];
  }

  public get_general_expiration() {
    if (this.get_key_type() == "checkpoint") {
      return this.get_checkpoint_expiration();
    }

    return this.key_data.key_expires;
  }

  public get_key_type() {
    return this.key_data.key_type;
  }

  public is_temp_key() {
    return this.key_data.key_type == "temporary";
  }

  // Temp Key
  public is_perm_key() {
    return this.key_data.key_type == "permanent";
  }

  public is_temp_key_expired() {
    return this.key_data.key_expires && this.key_data.key_expires < new Date() && this.is_perm_key();
  }

  // Checkpoint Key getters
  public is_checkpoint_key() {
    return this.key_data.key_type == "checkpoint";
  }

  public get_checkpoint_finished_at() {
    return this.key_data.checkpoints_finished_at ?? new Date();
  }

  public is_checkpoint_key_started() {
    return this.key_data.checkpoint_started_at && this.key_data.checkpoint_started_at > new Date() && this.key_data.checkpoint_index != "0";
  }

  public is_checkpoint_key_expired() {
    return this.key_data.key_expires && this.get_checkpoint_finished_at() < this.get_checkpoint_expiration();
  }

  // Assummes that the KeyHelper.finish_checkpoint() has been called
  public is_keysystem_finished(total_checkpoints: number) {
    if (this.get_key_type() != "checkpoint") {
      return true;
    }

    const checkpoint_valid = this.get_checkpoint_index() == total_checkpoints && total_checkpoints != 0;

    return checkpoint_valid && !this.is_checkpoint_key_expired();
  }

  public get_checkpoint_expiration(): Date {
    return new Date(
      this.get_checkpoint_expiration().getTime() ?? 0 +
      (parseInt(this.project_data.linkvertise_key_duration ?? "1") * 60 * 60 * 1000)
    );
  }

  public get_checkpoint_index() {
    return parseInt(this.key_data.checkpoint_index);
  }

  // Checkpoint Key Setters
  public async set_checkpoint_index(index: number) {
    this.key_data.checkpoint_index = index.toString();

    await db.update(users).set({
      checkpoint_index: this.key_data.checkpoint_index
    }).where(eq(users.key, this.key_data.key));
  }

  public async set_checkpoint_finished_at(finished_at: Date) {
    this.key_data.checkpoints_finished_at = finished_at;

    await db.update(users).set({
      checkpoints_finished_at: this.key_data.checkpoints_finished_at
    }).where(eq(users.key, this.key_data.key));
  }

  public async start_checkpoint() {
    const date = new Date();

    this.key_data.checkpoint_started_at = date;
    this.key_data.checkpoint_index = "0";
    this.key_data.checkpoints_finsihed = false;
    this.key_data.checkpoints_finished_at = null;

    await db.update(users).set({
      checkpoint_started_at: date,
      checkpoint_index: "0",
      checkpoints_finsihed: false,
      checkpoints_finished_at: null,
    }).where(eq(users.discord_id, this.project_id));
  }

  public async finish_checkpoint() {
    const date = new Date();

    this.key_data.checkpoints_finished_at = date;
    this.key_data.checkpoints_finsihed = true;

    await db.update(users).set({
      checkpoints_finsihed: true,
      checkpoints_finished_at: date,
    }).where(eq(users.discord_id, this.project_id));
  }
}