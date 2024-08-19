import { db } from "@/db";
import { Key, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    discord_id
  } = await request.json();

  if (!KeySchema.safeParse(JSON.parse(data)).success) {
    return new Response(JSON.stringify({
      success: false,
      error: "Inavlid data type"
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let validated_data = KeySchema.parse(JSON.parse(data));
  let database_data: Key = {
    project_id: params.script_id,
    discord_id: validated_data.discord_id,
    username: validated_data.username,
    note: validated_data.note,
    key: validated_data.key,
    key_type: validated_data.key_type,
    hwid: validated_data.hwid,
    executor: validated_data.executor,
    checkpoints_finished: validated_data.checkpoints_finished,
    checkpoints_finished_at: new Date(validated_data.checkpoints_finished_at ?? 0),
    checkpoint_index: validated_data.checkpoint_index,
    checkpoint_last_finished_at: new Date(validated_data.checkpoint_last_finished_at ?? 0),
    checkpoint_started_at: new Date(validated_data.checkpoint_started_at ?? 0),
    checkpoint_started: validated_data.checkpoint_started,
    key_expires: new Date(validated_data.key_expires ?? 0),
  };

  await db.update(users).set(database_data).where(eq(users.discord_id, discord_id));

  return new Response(JSON.stringify({
    success: true
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}