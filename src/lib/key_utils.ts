"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { Key, project, Project, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { check } from "drizzle-orm/mysql-core";

// I coudnt work with the spaghetti code that i made so uh
class KeyHelper {
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
  public userid: string = "";
  public key: string = "";
  public errored_user: boolean = false;
  public errored_project: boolean = false;

  public constructor(project_id: string, userid?: string, key?: string) {
    this.project_id = project_id;
    this.userid = userid ?? "";
    this.key = key ?? "";
  }

  public init() {
    return this.internal_init(this.project_id, this.userid, this.key);
  }

  // A wrapper for init, its just so it looks nicer
  public refresh() {
    return this.internal_init(this.project_id, this.userid, this.key);
  }

  private async internal_init(project_id: string, userid?: string,key?: string) {
    "use server";
    try {
      if (userid != "") {
        const project_response = await db.select().from(project).where(eq(project.project_id, project_id));
  
        if (project_response.length == 0) {
          this.errored_project = true;
          return;
        }
  
        this.project_data = project_response[0];

        const db_response = await db.select().from(users).where(sql`${users.discord_id} = ${userid} AND ${users.project_id} = ${project_id}`);
        
        if (db_response.length == 0) {
          this.errored_user = true;
          return;
        }
        
        this.key_data = db_response[0];
      } else if (key != "") {
        const project_response = await db.select().from(project).where(eq(project.project_id, project_id));
  
        if (project_response.length == 0) {
          this.errored_project = true;
          return;
        }
  
        this.project_data = project_response[0];
        
        const db_response = await db.select().from(users).where(sql`${users.key} = ${key} AND ${users.project_id} = ${project_id}`);
        
        if (db_response.length == 0) {
          this.errored_user = true;
          return;
        }
        
        this.key_data = db_response[0];
      } else {
        this.errored_project = true;
        this.errored_user = true;
        return;
      }
    } catch (error) {
      console.error("Failed to init key helper", error);
      this.errored_user = true;
      this.errored_project = true;
    }
  }

  public is_key_valid() {
    return !this.errored_user && !this.errored_project;
  }

  public is_user_valid() {
    return !this.errored_user;
  }

  public is_project_valid() {
    return !this.errored_project;
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
    return new Date(this.key_data.checkpoints_finished_at?.getTime() ?? new Date().getTime());
  }

  public is_checkpoint_key_started() {
    return this.key_data.checkpoint_started_at && this.key_data.checkpoint_started_at > new Date() && this.key_data.checkpoint_index != "0";
  }

  public is_checkpoint_key_expired() {
    return this.key_data.checkpoints_finished_at != null && this.get_checkpoint_finished_at() < this.get_checkpoint_expiration();
  }

  public get_checkpoint_started_at() {
    return new Date(this.key_data.checkpoint_started_at?.getTime() ?? new Date().getTime());
  }

  // Assummes that the KeyHelper.finish_checkpoint() has been called
  public is_keysystem_finished(total_checkpoints: number) {
    if (this.get_key_type() != "checkpoint") {
      return true;
    }

    const checkpoint_valid = this.get_checkpoint_index() == total_checkpoints && total_checkpoints != 0;

    return checkpoint_valid && !this.is_checkpoint_key_expired();
  }

  public is_keysystem_started() {
    const current_time = new Date();
    const checkpoint_started_at = this.get_checkpoint_started_at();
    const is_checkpoint_expired = this.is_checkpoint_key_expired();

    const key_duration = parseInt(this.project_data.linkvertise_key_duration ?? "1") * 60 * 1000;

    if (is_checkpoint_expired || current_time < new Date(checkpoint_started_at.getTime() + key_duration) || this.get_checkpoint_index() == 0) {
      return false;
    }

    return true;
  }

  public get_checkpoint_expiration(): Date {
    const additional_time = parseInt(this.project_data.linkvertise_key_duration ?? "1") * 60 * 60 * 1000;
    return new Date(this.get_checkpoint_finished_at().getTime() + additional_time);
  }

  public get_checkpoint_index() {
    return parseInt(this.key_data.checkpoint_index);
  }

  // Checkpoint Key Setters
  public async set_checkpoint_index(index: number) {
    "use server";
    this.key_data.checkpoint_index = index.toString();

    await db.update(users).set({
      checkpoint_index: this.key_data.checkpoint_index
    }).where(eq(users.key, this.key_data.key));
  }

  public async set_checkpoint_finished_at(finished_at: Date) {
    "use server";
    this.key_data.checkpoints_finished_at = finished_at;

    await db.update(users).set({
      checkpoints_finished_at: this.key_data.checkpoints_finished_at
    }).where(eq(users.key, this.key_data.key));
  }

  public async start_checkpoint() {
    "use server";
    const date = new Date();

    const session = await auth();
    const userid = session?.user?.id ?? "0";

    this.key_data.checkpoint_started_at = date;
    this.key_data.checkpoint_index = "0";
    this.key_data.checkpoints_finsihed = false;
    this.key_data.checkpoints_finished_at = null;

    await db.update(users).set({
      checkpoint_started_at: date,
      checkpoint_index: "0",
      checkpoints_finsihed: false,
      checkpoints_finished_at: null,
    }).where(sql`${users.project_id} = ${this.project_id} AND ${users.discord_id} = ${userid}`);
  }

  public async increment_checkpoint_index() {
    const date = new Date();

    let new_checkpoint_index = parseInt(this.key_data.checkpoint_index) + 1;
    
    const session = await auth();
    const userid = session?.user?.id ?? "0";


    if (this.key_data.checkpoint_index == "0") {
      this.key_data.checkpoint_started_at = date;
      await db.update(users).set({
        checkpoint_index: "1",
        checkpoint_started_at: date,
        checkpoints_finsihed: false,
        checkpoints_finished_at: null,
      }).where(sql`${users.project_id} = ${this.project_id} AND ${users.discord_id} = ${userid}`);
      return;
    }
    
    await db.update(users).set({
      checkpoint_index: new_checkpoint_index.toString(),
    }).where(sql`${users.project_id} = ${this.project_id} AND ${users.discord_id} = ${userid}`);
    console.log("updated")
  }

  public async finish_checkpoint() {
    const date = new Date();

    const session = await auth();
    const userid = session?.user?.id ?? "0";

    this.key_data.checkpoints_finished_at = date;
    this.key_data.checkpoints_finsihed = true;

    await db.update(users).set({
      checkpoints_finsihed: true,
      checkpoints_finished_at: date,
    }).where(sql`${users.project_id} = ${this.project_id} AND ${users.discord_id} = ${userid}`);
  }
}

// very hacky way (wow thanks vercel!! :D)
export async function create_key_helper(project_id: string) {
  const session = await auth();
  const userid = session?.user?.id ?? "0";
  
  const KeyUtility = new KeyHelper(project_id, userid);
  await KeyUtility.init();

  return KeyUtility;
}

export async function create_key_helper_key(project_id: string, key: string) {
  const session = await auth();
  const userid = session?.user?.id ?? "0";
  
  const KeyUtility = new KeyHelper(project_id, undefined, key);
  await KeyUtility.init();

  return KeyUtility;
}