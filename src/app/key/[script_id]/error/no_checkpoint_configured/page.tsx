import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { SVGProps } from "react";
const Discord = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 199" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M216.856 16.597A208.502 208.502 0 0 0 164.042 0c-2.275 4.113-4.933 9.645-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0-1.832-4.4-4.55-9.933-6.846-14.046a207.809 207.809 0 0 0-52.855 16.638C5.618 67.147-3.443 116.4 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193A161.094 161.094 0 0 0 79.735 175.3a136.413 136.413 0 0 1-21.846-10.632 108.636 108.636 0 0 0 5.356-4.237c42.122 19.702 87.89 19.702 129.51 0a131.66 131.66 0 0 0 5.355 4.237 136.07 136.07 0 0 1-21.886 10.653c4.006 8.02 8.638 15.67 13.873 22.848 21.142-6.58 42.646-16.637 64.815-33.213 5.316-56.288-9.08-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2.02 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.014-11.805-23.014-26.18s10.148-26.2 23.014-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Z" fill="#5865F2" /></svg>;

export default async function NoCheckpointConfigured({ params }: { params: { script_id: string } }) {

  const project_query_response = await db
    .select()
    .from(project)
    .where(eq(project.project_id, params.script_id));
  
  const does_project_exist = project_query_response.length > 0;
  const project_data = project_query_response[0];

  if (!does_project_exist || project_data.project_type !== "free-paywall") {
    return notFound();
  }

  const host = headers().get("host") ?? "";

  const discord_link = project_data.discord_link ?? "https://discord.gg/tvS3hMFWKs";
  const discord_id = discord_link.replaceAll("https://discord.gg/", "").replaceAll("https://discord.com/invite/", "").replaceAll("https://discord.com/", "").replaceAll("discord.gg/", "").replaceAll("discord.com/invite/", "").replaceAll("discord.com/", "");

  return (
    <main className="flex justify-center items-center h-screen w-screen">
      <Card>
        <CardHeader>
          <CardTitle>Oops something went wrong</CardTitle>
          <CardDescription><span className="text-primary font-bold">{project_data.name}</span> has no checkpoints configured yet :(<br />Contact the script creator to fix this configuration issue</CardDescription>
        </CardHeader>

        <CardContent>
            <Link href={process.env.NODE_ENV == "production" ? `https://${host}/key/${params.script_id}` : `http://${host}/key/${params.script_id}`}>
              <Button size={"sm"}>Key Page</Button>
            </Link>

            {project_data.discord_link && (
              <Link href={`https://discord.com/invite/${discord_id}`} target="_blank">
                <Button size={"icon"}>
                  <Discord />
                </Button>
              </Link>
            )}
        </CardContent>
        
        <CardFooter>
          <p className="text-xs text-muted-foreground">ERR: no_checkpoint_configured</p>
        </CardFooter>
      </Card>
    </main>
  )
}