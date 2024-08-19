import { db } from "@/db";
import { Key, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const KeySchema = z.object({
  project_id: z.string(),
  key: z.string(),
  key_expires: z.string().nullable(),
  key_type: z.enum(["temporary", "permanent", "checkpoint"]).nullable(),
  discord_id: z.string(),
  username: z.string(),
  note: z.string().nullable(),
  hwid: z.string().nullable(),
  executor: z.string().nullable(),
  checkpoints_finished: z.boolean(),
  checkpoints_finished_at: z.string().nullable(),
  checkpoint_index: z.string(),
  checkpoint_last_finished_at: z.string().nullable(),
  checkpoint_started_at: z.string().nullable(),
  checkpoint_started: z.boolean(),
});


export async function POST(request: Request, {params}: {params: {script_id: string}}) {
  let {
    data,
    discord_id,
    reset_checkpoint_data
  } = await request.json();

  if (!KeySchema.safeParse(data).success) {
    return NextResponse.json({
      success: false,
      error: "Inavlid data type",
    }, { status: 400 });
  }

  let validated_data = KeySchema.parse(data);

  let checkpoints_finished = validated_data.checkpoints_finished;
  let checkpoints_finished_at: Date | null = new Date(validated_data.checkpoints_finished_at ?? 0);
  let checkpoint_index = validated_data.checkpoint_index;
  let checkpoint_last_finished_at: Date | null = new Date(validated_data.checkpoint_last_finished_at ?? 0);
  let checkpoint_started_at: Date | null = new Date(validated_data.checkpoint_started_at ?? 0);
  let checkpoint_started = validated_data.checkpoint_started;
  let key_expires: Date | null = new Date(validated_data.key_expires ?? 0);


  if (reset_checkpoint_data) {
    /*validated_data.checkpoints_finished = false;
    validated_data.checkpoint_started = false;
    validated_data.checkpoint_index = "0";
    validated_data.checkpoint_last_finished_at = null;
    validated_data.checkpoint_started_at = null;
    validated_data.checkpoints_finished_at = null;*/

    checkpoints_finished = false;
    checkpoints_finished_at = null;
    checkpoint_index = "0";
    checkpoint_last_finished_at = null;
    checkpoint_started_at = null;
    checkpoint_started = false;
  }

  await db.update(users).set({
    project_id: params.script_id,
    discord_id: validated_data.discord_id,
    username: validated_data.username,
    note: validated_data.note,
    key: validated_data.key,
    key_type: validated_data.key_type,
    hwid: validated_data.hwid,
    executor: validated_data.executor,
    checkpoints_finished: validated_data.checkpoints_finished,
    checkpoints_finished_at: checkpoints_finished_at,
    checkpoint_index: validated_data.checkpoint_index,
    checkpoint_last_finished_at: checkpoint_last_finished_at,
    checkpoint_started_at: checkpoint_started_at,
    checkpoint_started: checkpoint_started,
    key_expires: key_expires,
  }).where(eq(users.discord_id, discord_id));

  return NextResponse.json({
    success: true,
    new_data: {
      project_id: params.script_id,
      discord_id: validated_data.discord_id,
      username: validated_data.username,
      note: validated_data.note,
      key: validated_data.key,
      key_type: validated_data.key_type,
      hwid: validated_data.hwid,
      executor: validated_data.executor,
      checkpoints_finished: validated_data.checkpoints_finished,
      checkpoints_finished_at: checkpoints_finished_at,
      checkpoint_index: validated_data.checkpoint_index,
      checkpoint_last_finished_at: checkpoint_last_finished_at,
      checkpoint_started_at: checkpoint_started_at,
      checkpoint_started: checkpoint_started,
      key_expires: key_expires,
    }
  });
}