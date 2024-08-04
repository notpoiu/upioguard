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
      <Card>
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
  "checkpoint-finished": "Thank you for supporting this script, here is your checkpoint key, this key will be valid for {time} hours",
  "checkpoint-not-finished": "By doing this checkpoint system you for supporting this script, thank you!",
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

  if (user_data_resp.length == 0) {
    return notFound();
  }

  const user_data = user_data_resp[0];

  const key = user_data.key;
  const key_type = user_data.key_type;
  const expires = user_data.key_expires ?? new Date(0); // if the key is a checkpoint expiry is the time when the checkpoints got finished

  let description_key: string = key_type ?? "checkpoint-not-finished";

  const key_duration = parseInt(project_data.linkvertise_key_duration) ?? 1;
  const is_checkpoint_key_expired = expires < new Date(expires.getTime() + (key_duration * 60 * 60 * 1000));
  let current_checkpoint_index = parseInt(user_data.checkpoint_index);

  if (key_type == "checkpoint") {
    if (current_checkpoint_index == checkpoints_db_response.length && !is_checkpoint_key_expired) {
      description_key = "checkpoint-finished";
    } else {
      description_key = "checkpoint-not-finished"
    }
  }

  if (key_type == "checkpoint" && is_checkpoint_key_expired) {
    await db.update(users).set({
      checkpoint_index: "0"
    }).where(eq(users.discord_id, session.user.id));
    current_checkpoint_index = 0;
  }

  const did_finish_keysystem = current_checkpoint_index == checkpoints_db_response.length && checkpoints_db_response.length != 0;

  const host = headers().get("host") ?? "";
  console.log(checkpoints_db_response);
  let next_checkpoint_url = checkpoints_db_response[current_checkpoint_index + 1]?.checkpoint_url;
  
  if (next_checkpoint_url == undefined) {
    next_checkpoint_url = process.env.NODE_ENV == "production" ? `https://${host}/key/${params.script_id}/error/no_checkpoint_configured` : `http://${host}/key/${params.script_id}/error/no_checkpoint_configured`;
  }

  console.log(process.env.NODE_ENV);
  // @ts-ignore
  let description = messages[description_key as "temporary" | "permanent" | "checkpoint" | "checkpoint-finished" | "checkpoint-not-finished"];
  description = description.replace("{expiry}", expires?.toLocaleString() ?? "permanent");
  description = description.replace("{time}", ((expires?.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString());

  return (
    <KeySystemWrapper script_data={project_data} description={description}>
      {key && key_type == "temporary" || key_type == "permanent" && (
        <KeyInput key={key}  />
      )}

      {key && key_type == "checkpoint" && !is_checkpoint_key_expired && !did_finish_keysystem && (
        <KeyInput key={key}  />
      )}

      {key && key_type == "checkpoint" && is_checkpoint_key_expired && !did_finish_keysystem && (
        <Checkpoint env={process.env.NODE_ENV} currentCheckpointIndex={current_checkpoint_index} checkpointurl={next_checkpoint_url}  />
      )}
    </KeySystemWrapper>
  );
}
