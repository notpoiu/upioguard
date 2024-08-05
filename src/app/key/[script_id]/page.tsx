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

  const KeyUtility = await create_key_helper(user_data.key, params.script_id);

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
  description = description.replace("{time}", (((KeyUtility.get_general_expiration()?.getTime() ?? 0) - new Date().getTime()) / (1000 * 60 * 60 * 24)).toString());


  if (key_type == "checkpoint") {
    let current_checkpoint_index = KeyUtility.get_checkpoint_index();
  
    // Handle checkpoint key started
    if (KeyUtility.is_checkpoint_key_started()) {
      await KeyUtility.start_checkpoint();
      current_checkpoint_index = 0;
    }
  
    // Intermadiate checkpoint reached
    const finished_key_system = KeyUtility.is_keysystem_finished(checkpoints_db_response.length);
    if (KeyUtility.is_checkpoint_key_expired() && !finished_key_system) {
      const is_valid = await verify_turnstile(parseInt(project_data.linkvertise_key_duration ?? "1"));
  
      if (is_valid) {
        await KeyUtility.set_checkpoint_index(current_checkpoint_index + 1);
        current_checkpoint_index++;
      }
    } else if (key_type == "checkpoint" && finished_key_system) {
      await KeyUtility.finish_checkpoint();
    }
    
  
    // handle checkpoint
    const did_finish_keysystem = KeyUtility.is_keysystem_finished(checkpoints_db_response.length);
    const host = headers().get("host") ?? "";
  
    let next_checkpoint_url = checkpoints_db_response[current_checkpoint_index + 1]?.checkpoint_url;
    
    if (next_checkpoint_url == undefined) {
      next_checkpoint_url = process.env.NODE_ENV == "production" ? `https://${host}/key/${params.script_id}/error/no_checkpoint_configured` : `http://${host}/key/${params.script_id}/error/no_checkpoint_configured`;
    }

    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {key && !KeyUtility.is_checkpoint_key_expired() && did_finish_keysystem && (
          <KeyInput key={key}  />
        )}
  
        {key && KeyUtility.is_checkpoint_key_expired() || !did_finish_keysystem && (
          <Checkpoint env={process.env.NODE_ENV} currentCheckpointIndex={current_checkpoint_index} checkpointurl={next_checkpoint_url}  />
        )}
      </KeySystemWrapper>
    )
  }

  if (key_type == "temporary" || key_type == "permanent") {
    return (
      <KeySystemWrapper script_data={project_data} description={description}>
        {key && (key_type == "temporary" || key_type == "permanent") && (
          <KeyInput key={key}  />
        )}
      </KeySystemWrapper>
    );
  }
  return null;
}
