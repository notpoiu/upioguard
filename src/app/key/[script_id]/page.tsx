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
import { eq, is, sql } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { KeyInput } from "./components/valid_key";
import { Checkpoint } from "./components/checkpoint";
import { verify_turnstile } from "./key_server";
import { create_key_helper } from "@/lib/key_utils";
import { generate_key } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { RateLimit } from "./components/ratelimit";


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
  "checkpoint-not-finished": "By doing this checkpoint, you are supporting this script, thank you!",
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

  const user_data_resp = await db.select().from(users).where(sql`${users.discord_id} = ${session.user.id} AND ${users.project_id} = ${params.script_id}`);

  if (user_data_resp.length == 0 && project_data.project_type == "free-paywall") {
    await db.insert(users).values({
      project_id: params.script_id,
      discord_id: session.user.id ?? "0",
      username: session.user.name ?? "Anonymous",
      note: null,
      key_type: "checkpoint",
      key: generate_key(),
      checkpoints_finished: false,
      checkpoint_started: false,
    });
  } else if (user_data_resp.length == 0 && project_data.project_type != "free-paywall") {
    return notFound();
  }
  
  const KeyUtility = await create_key_helper(params.script_id);

  const [key, key_type] = KeyUtility.get_key();

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

  let time = `${Math.floor(Math.abs(KeyUtility.get_checkpoint_expiration().getTime() - new Date().getTime()) / 36e5)} hours`;

  if (Math.floor(Math.abs(KeyUtility.get_checkpoint_expiration().getTime() - new Date().getTime()) / 36e5) == 0) {
    time = `${diff_minutes(KeyUtility.get_checkpoint_expiration(), new Date())} minutes`;
  }

  description = description.replace("{time}", time);

  if (key_type == "checkpoint") {
    let { show_checkpoint, current_checkpoint_index, error_key_occured } = await KeyUtility.handleCheckpointKey(project_data, checkpoints_db_response);

    // handle checkpoint   
    const host = headers().get("host") ?? "";
  
    let next_checkpoint_url = checkpoints_db_response[current_checkpoint_index ?? 0]?.checkpoint_url;
    let old_checkpoint_url = checkpoints_db_response[Math.abs((current_checkpoint_index ?? 0) - 1)]?.checkpoint_url;

    if (next_checkpoint_url == undefined) {
      next_checkpoint_url = process.env.NODE_ENV == "production" ? `https://${host}/key/${params.script_id}/error/no_checkpoint_configured` : `http://${host}/key/${params.script_id}/error/no_checkpoint_configured`;
    }

    const referer = headers().get("referer") ?? "";
    if (show_checkpoint && old_checkpoint_url != undefined && current_checkpoint_index != 0 && new URL(old_checkpoint_url).origin.includes(referer)) {
      error_key_occured = true;
    }

    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {error_key_occured && (
          <RateLimit minimum_checkpoint_switch_duration={project_data.minimum_checkpoint_switch_duration ?? "15"} old_link={old_checkpoint_url ?? next_checkpoint_url} />
        )}

        {key && !show_checkpoint && !error_key_occured && (
          <KeyInput upioguard_key={key} project_id={params.script_id} />
        )}
  
        {!error_key_occured && show_checkpoint && (
          <Checkpoint env={process.env.NODE_ENV} currentCheckpointIndex={current_checkpoint_index ?? 0} checkpointurl={next_checkpoint_url} project_id={params.script_id} minimum_checkpoint_switch_duration={project_data.minimum_checkpoint_switch_duration ?? "15"}  />
        )}
      </KeySystemWrapper>
    )
  }

  if (key_type == "temporary" || key_type == "permanent") {
    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {key && (key_type == "temporary" || key_type == "permanent") && (
          <KeyInput upioguard_key={key} project_id={params.script_id} />
        )}
      </KeySystemWrapper>
    );
  }
  return null;
}
