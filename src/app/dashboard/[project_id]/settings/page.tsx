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
import { EyeIcon } from "lucide-react";


export default function Settings({params}: {params: {project_id: string}}) {

  const router = useRouter();

  const { data, refresh } = useProjectData();

  const [project_name, setProjectName] = React.useState(data.name ?? "Unknown");
  const [project_description, setProjectDescription] = React.useState(data.description ?? "Unknown");
  const [project_type, setProjectType] = React.useState<"paid" | "free-paywall">(data.project_type ?? "paid");
  const [discord_link, setDiscordLink] = React.useState(data.discord_link ?? null);
  const [discord_webhook, setDiscordWebhook] = React.useState(data.discord_webhook ?? null);

  const [github_repo, setGithubRepo] = React.useState<{ name: string, owner: string, path: string }>({
    name: data.github_repo ?? "",
    owner: data.github_owner ?? "",
    path: data.github_path ?? "",
  });

  const [github_token, setGithubToken] = React.useState(data.github_token ?? "");

  const [set_visible_token, setSetVisibleToken] = React.useState(false);

  useEffect(() => {
    setProjectName(data.name ?? "Unknown");
    setProjectDescription(data.description ?? "Unknown");
    setProjectType(data.project_type ?? "paid");
    setDiscordLink(data.discord_link ?? null);
    setDiscordWebhook(data.discord_webhook ?? null);
  }, [data]);

  function fetch_owner_repo_path(url: string) {
    const url_param_regex = /\?.*/;
    
    url = url.replace(url_param_regex, "");

    if (url.startsWith("https://github.com/")) {
      const github_owner_regex = /github\.com\/([^/]+)/;
      const github_repo_regex = /github\.com\/[^/]+\/([^/]+)/;
      const github_path_regex = /github\.com\/[^/]+\/[^/]+\/blob\/main\/([^/]+)/;

      const github_owner = github_owner_regex.exec(url)?.[1];
      const github_repo = github_repo_regex.exec(url)?.[1];
      const github_path = github_path_regex.exec(url)?.[1];
      return [github_owner, github_repo, github_path];
    }

    if (url.startsWith("https://raw.githubusercontent.com")) {
      const github_owner_regex = /raw\.githubusercontent\.com\/([^/]+)/;
      const github_repo_regex = /raw\.githubusercontent\.com\/[^/]+\/([^/]+)/;
      const github_path_regex = /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/main\/([^/]+)/;

      const github_owner = github_owner_regex.exec(url)?.[1];
      const github_repo = github_repo_regex.exec(url)?.[1];
      const github_path = github_path_regex.exec(url)?.[1];
      return [github_owner, github_repo, github_path];
    }

    return ["", "", ""];
  }

  function saveProjectData() {
    const update_data = data;

    update_data.name = project_name;
    update_data.description = project_description;
    update_data.project_type = project_type;
    update_data.discord_link = discord_link;
    update_data.discord_webhook = discord_webhook;
    update_data.github_owner = github_repo.name;
    update_data.github_path = github_repo.path;
    update_data.github_token = github_token;

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
        <TabsContent value="main" className="*:mb-5 *:mt-5">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
        <TabsContent value="checkpoint" className="*:mb-5 *:mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon...</CardTitle>
              <CardDescription>Coming in the next version of upioguard</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="advanced" className="*:mb-5 *:mt-5">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Github Repo</CardTitle>
              <CardDescription>Set a github repo so upioguard can fetch the script file</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <Input placeholder="owner/repo" value={`https://github.com/${github_repo.owner}/${github_repo.name}/blob/main/${github_repo.path}`} onChange={(e) => {
                const [owner, repo, path] = fetch_owner_repo_path(e.target.value);
                setGithubRepo({ name: repo ?? "", owner: owner ?? "", path: path ?? "" });
              }} />
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This url will be used to fetch the script file
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Github Access Token</CardTitle>
              <CardDescription>Set a github access token so upioguard can fetch the script file</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col">
              <div className="flex flex-row gap-2 w-full">
                <Input placeholder="ghp_..." value={github_token} type={set_visible_token ? "text" : "password"} onChange={(e) => setGithubToken(e.target.value)} className="w-full" />
                <Button size={"icon"} onClick={() => setSetVisibleToken(!set_visible_token)}>
                  <EyeIcon />
                </Button>
              </div>
              <div className="w-full flex justify-between mt-2">
                <div className="flex justify-center items-center">
                  <p className="text-xs text-muted-foreground">
                    This token will be used to fetch the script file
                  </p>
                </div>
                <Button size={"sm"} onClick={saveProjectData}>Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
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
                          }, 3000);
                          return "Project deleted, redirecting in 3s back to dashboard...";
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