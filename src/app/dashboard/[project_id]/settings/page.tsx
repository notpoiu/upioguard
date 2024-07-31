"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useProjectData } from "../components/project_data_provider";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { delete_project, update_project } from "../../server";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Settings({params}: {params: {project_id: string}}) {

  const router = useRouter();

  const { data, refresh } = useProjectData();

  const [project_name, setProjectName] = React.useState(data.name ?? "Unknown");
  const [project_description, setProjectDescription] = React.useState(data.description ?? "Unknown");
  const [project_type, setProjectType] = React.useState<"paid" | "free-paywall">(data.project_type ?? "paid");
  const [discord_link, setDiscordLink] = React.useState(data.discord_link ?? null);
  const [discord_webhook, setDiscordWebhook] = React.useState(data.discord_webhook ?? null);

  useEffect(() => {
    setProjectName(data.name ?? "Unknown");
    setProjectDescription(data.description ?? "Unknown");
    setProjectType(data.project_type ?? "paid");
    setDiscordLink(data.discord_link ?? null);
    setDiscordWebhook(data.discord_webhook ?? null);
  }, [data]);

  function saveProjectData() {
    const update_data = data;

    update_data.name = project_name;
    update_data.description = project_description;
    update_data.project_type = project_type;
    update_data.discord_link = discord_link;
    update_data.discord_webhook = discord_webhook;

    toast.promise(update_project(params.project_id, update_data), {
      loading: "Updating project...",
      success: () => {
        refresh();
        return "Project updated!";
      },
      error: "Failed to update project",
    });
  }

  return (
    <main>
      <Tabs defaultValue="main" orientation='horizontal'>
        <TabsList>
          <TabsTrigger value="main">Main</TabsTrigger>
          {data.project_type === "free-paywall" && <TabsTrigger value="checkpoint">Checkpoint</TabsTrigger>}
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsContent value="main">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Script Name</CardTitle>
              <CardDescription>Enter a new name for your script</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Input placeholder="Project Name" value={project_name} onChange={(e) => setProjectName(e.target.value)} />
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This name will be displayed on the dashboard
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Script Description</CardTitle>
              <CardDescription>Enter a new description for your script</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Input placeholder="Project Description" value={project_description} onChange={(e) => setProjectDescription(e.target.value)} />
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This description will be displayed on the dashboard
                  </p>
                </div>
                <Button size={"sm" } onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Discord Webhook</CardTitle>
              <CardDescription>Set a discord webhook URL to send execution data on script execution</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Input placeholder="https://discord.com/api/webhooks/..." value={discord_webhook ?? ""} onChange={(e) => setDiscordWebhook(e.target.value)} />
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This webhook will be used to send execution data to discord
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-5 mb-5">
            <CardHeader>
              <CardTitle>Discord Link</CardTitle>
              <CardDescription>Set a discord link so users can join your discord server when the script errors</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Input placeholder="https://discord.gg/..." value={discord_link ?? ""} onChange={(e) => setDiscordLink(e.target.value)} />
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This link will be used to invite users to your discord server
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="checkpoint">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Coming Soon...</CardTitle>
              <CardDescription>Coming in the next version of upioguard</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="advanced">
          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Project Type</CardTitle>
              <CardDescription>Select the type of your project</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Select onValueChange={(value) => setProjectType(value as "paid" | "free-paywall")} value={project_type}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="free-paywall">Freemium</SelectItem>
                </SelectContent>
              </Select>

              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This will determine if you can use linkvertise keys
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>Delete Project</CardTitle>
              <CardDescription>Delete this project and all associated data such as api keys, execution data and user key data</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Project</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      script and remove the data from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      toast.promise(delete_project(params.project_id), {
                        loading: "Deleting project...",
                        success: () => {
                          setTimeout(() => {
                            router.push("/dashboard");
                          }, 1000);
                          return "Project deleted, redirecting back to dashboard...";
                        },
                        error: "Failed to delete project",
                      })}}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>

        </TabsContent>
      </Tabs>

    </main>
  )

}