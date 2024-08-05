import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { checkpoints, project, Project, users } from "@/db/schema";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { KeyInput } from "./components/valid_key";
import { Checkpoint } from "./components/checkpoint";
import { check } from "drizzle-orm/mysql-core";
import { Key } from "lucide-react";
import { verify } from "crypto";
import { verify_turnstile } from "./key_server";
import { create_key_helper } from "@/lib/key_utils";
import { generate_key } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { log } from "@/lib/logging";

function KeySystemWrapper({
  script_data,
  title,
  description,
  children,
}: {
  script_data: Project;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex justify-center items-center h-screen w-screen">
      <Card className="max-w-[50vw] max-md:max-w-[80vw] max-sm:max-w-[90vw]">
        <CardHeader>
          <CardTitle>{title ?? "Key System - " + script_data.name}</CardTitle>
          <CardDescription>{description ?? script_data.description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </main>
  );
}

const messages = {
  "temporary": "Thank you for supporting this script, here is your temp key, this key will expire the {expiry}",
  "permanent": "Thank you for supporting this script, here is your permanent key",
  "checkpoint-finished": "Thank you for supporting this script, here is your checkpoint key, this key will be valid until {time}",
  "checkpoint-not-finished": "By doing this checkpoint system you for supporting this script, thank you!",
}

function diff_minutes(dt2: Date, dt1: Date): number
 {
  // Calculate the difference in milliseconds between the two provided dates and convert it to seconds
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  // Convert the difference from seconds to minutes
  diff /= 60;
  // Return the absolute value of the rounded difference in minutes
  return Math.abs(Math.round(diff));
 }

export default async function KeyPage({
  params,
}: {
  params: { script_id: string };
}) {
  const session = await auth();

  const project_query_response = await db
    .select()
    .from(project)
    .where(eq(project.project_id, params.script_id));

  const does_project_exist = project_query_response.length > 0;
  const project_data = project_query_response[0];

  if (!does_project_exist || project_data.project_type !== "free-paywall") {
    return notFound();
  }

  if (!session || !session.user || !session.user.id) {
    return (
      <KeySystemWrapper script_data={project_data}>
        <form
          action={async () => {
            "use server";
            cookies().set("upioguard-signintype", "keysystem");
            cookies().set("upioguard-keysystem", JSON.stringify({
              project_id: params.script_id
            }));
            await signIn("discord");
          }}
        >
          <Button className="flex flex-row justify-center items-center">
            Sign in using <DiscordLogoIcon className="ml-2" />
          </Button>
        </form>
      </KeySystemWrapper>
    );
  }

  const checkpoints_db_response = await db.select().from(checkpoints).where(eq(checkpoints.project_id, params.script_id));

  const user_data_resp = await db.select().from(users).where(eq(users.discord_id, session.user.id));

  if (user_data_resp.length == 0 && project_data.project_type == "free-paywall") {
    await db.insert(users).values({
      project_id: params.script_id,
      discord_id: session.user.id ?? "0",
      username: session.user.name ?? "Anonymous",
      note: null,
      key_type: "checkpoint",
      key: generate_key(),
    });
  } else if (user_data_resp.length == 0 && project_data.project_type != "free-paywall") {
    return notFound();
  }
  
  const KeyUtility = await create_key_helper(params.script_id);

  const [key, key_type] = KeyUtility.get_key();
  console.log(key, key_type);

  let description_key: string = KeyUtility.get_key_type() ?? "checkpoint-not-finished";
  
  if (key_type == "checkpoint") {
    if (KeyUtility.get_checkpoint_index() == checkpoints_db_response.length && !KeyUtility.is_checkpoint_key_expired()) {
      description_key = "checkpoint-finished";
    } else {
      description_key = "checkpoint-not-finished"
    }
  }

  // @ts-ignore
  let description = messages[description_key as "temporary" | "permanent" | "checkpoint" | "checkpoint-finished" | "checkpoint-not-finished"];
  description = description.replace("{expiry}", KeyUtility.get_general_expiration()?.toLocaleString() ?? "permanent");

  let time = `${Math.abs(KeyUtility.get_checkpoint_expiration().getTime() - new Date().getTime()) / 36e5} hours`;

  if (Math.floor(Math.abs(KeyUtility.get_checkpoint_expiration().getTime() - new Date().getTime()) / 36e5) == 0) {
    time = `${diff_minutes(KeyUtility.get_checkpoint_expiration(), new Date())} minutes`;
  }

  description = description.replace("{time}", time);

  if (key_type == "checkpoint") {
    await log(`key_type : "checkpoint"`);
    let current_checkpoint_index = KeyUtility.get_checkpoint_index();
    
    // Handle checkpoint key started
    if (KeyUtility.is_checkpoint_key_expired()) {
      await KeyUtility.start_checkpoint();
      current_checkpoint_index = 0;
    }
    
    await log(`current_checkpoint_index : ${current_checkpoint_index}`);
    // Intermadiate checkpoint reached
    const finished_key_system = KeyUtility.is_keysystem_finished(checkpoints_db_response.length);
    let error_key_occured = false;

    await log(`finished_key_system : ${finished_key_system}`);

    if (!KeyUtility.is_checkpoint_key_expired() && !finished_key_system) {
      await log(`!KeyUtility.is_checkpoint_key_expired() && !finished_key_system`);
      const is_valid = await verify_turnstile(parseInt(project_data.linkvertise_key_duration ?? "1"));

      await log(`is_valid : ${is_valid}`);
      error_key_occured = !is_valid;
    }

    await log(`error_key_occured : ${error_key_occured}`);

    // finished checkpoint
    if (!KeyUtility.is_checkpoint_key_expired() && finished_key_system && KeyUtility.get_checkpoint_index() == checkpoints_db_response.length) {
      await KeyUtility.finish_checkpoint();
    }

    await log(`finished_key_system : ${finished_key_system}`);
    
  
    // handle checkpoint
    try{
      await log(`did_finish_keysystem : ${KeyUtility.is_keysystem_finished(checkpoints_db_response.length)}`);
    } catch (e) {
      await log(`did_finish_keysystem : ${e}`);
    }
    const did_finish_keysystem = KeyUtility.is_keysystem_finished(checkpoints_db_response.length);
    await log(`did_finish_keysystem : ${did_finish_keysystem}`);
    const host = headers().get("host") ?? "";
    await log(`host : ${host}`);
  
    let next_checkpoint_url = checkpoints_db_response[current_checkpoint_index]?.checkpoint_url;
    await log(`next_checkpoint_url : ${next_checkpoint_url}`);
    if (current_checkpoint_index < checkpoints_db_response.length) {
      await log(`current_checkpoint_index < checkpoints_db_response.length`);
      await KeyUtility.finish_checkpoint();
    } else if (next_checkpoint_url == undefined) {
      await log(`next_checkpoint_url == undefined`);
      next_checkpoint_url = process.env.NODE_ENV == "production" ? `https://${host}/key/${params.script_id}/error/no_checkpoint_configured` : `http://${host}/key/${params.script_id}/error/no_checkpoint_configured`;
    }

    await log(`next_checkpoint_url : ${next_checkpoint_url}`);

    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {error_key_occured && (
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-lg">
              Something went wrong, maybe you came back to this page too fast (minimum {project_data.minimum_checkpoint_switch_duration} seconds between checkpoints)
            </p>
          </div>
        )}

        {key && !KeyUtility.is_checkpoint_key_expired() && did_finish_keysystem && !error_key_occured && (
          <KeyInput upioguard_key={key}>
            <Input id="key" value={key} readOnly />
          </KeyInput>
        )}
  
        {key && KeyUtility.is_checkpoint_key_expired() || !did_finish_keysystem && !error_key_occured && (
          <Checkpoint env={process.env.NODE_ENV} currentCheckpointIndex={current_checkpoint_index} checkpointurl={next_checkpoint_url} project_id={params.script_id}  />
        )}
      </KeySystemWrapper>
    )
  }

  if (key_type == "temporary" || key_type == "permanent") {
    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {key && (key_type == "temporary" || key_type == "permanent") && (
          <KeyInput upioguard_key={key}>
            <Input id="key" value={key} readOnly />
          </KeyInput>
        )}
      </KeySystemWrapper>
    );
  }
  return null;
}
