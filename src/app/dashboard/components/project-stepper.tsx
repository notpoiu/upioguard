"use client";

import { Step, type StepItem, Stepper, useStepper } from "@/components/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { generate_project } from "../server";
import { toast } from "sonner";

const steps = [
	{ label: "General" },
	{ label: "Github" },
	{ label: "Miscellaneous" },
] satisfies StepItem[];

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link";
import Confetti from "@/components/magicui/confetti";
import { useRouter } from "next/navigation";


export default function ProjectCreationStepper({is_first_time}: {is_first_time: boolean}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const [discord_link, setDiscordLink] = React.useState("");
  const [github_url, setGithubUrl] = React.useState("");
  const [github_token, setGithubToken] = React.useState("");
  const [is_submitting, setIsSubmitting] = React.useState(false);
  const [script_type, setScriptType] = React.useState<"paid" | "free-paywall">("paid");

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

  function reset() {
    setName("");
    setDescription("");
    setDiscordLink("");
    setGithubUrl("");
  }

  function CreateProject() {
    if (name == "" || description == "" || github_url == "") {
      toast.error("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    const [github_owner, github_repo, github_path] = fetch_owner_repo_path(github_url);

    const is_empty = github_owner == "" || github_repo == "" || github_path == "";
    const is_null = github_owner == null || github_repo == null || github_path == null;
    if (is_empty || is_null) {
      toast.error("Github URL is invalid did you add a valid url?");
      setIsSubmitting(false);
      return;
    }

    generate_project(name, description, script_type,discord_link, github_owner, github_repo, github_path, github_token).then(() => {
      toast.success("Project created successfully!");
    }).catch((err) => {
      toast.error(err);
    });
  }

	return (
		<div className="flex min-w-[50vw] flex-col gap-4 mt-5">
			<Stepper initialStep={0} steps={steps}>
        <Step label={"General"}>
          <div className="h-40 flex items-center justify-center my-2 gap-2 border bg-secondary text-primary rounded-md">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your script" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Short description of your script" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
				</Step>
        <Step label={"Github"}>
          <div className="h-40 flex flex-row relative items-center justify-center my-2 border bg-secondary text-primary rounded-md">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="github_url">Github URL</Label>
              <Input id="github_url" placeholder="URL to your obfuscated script file in github (can be private)" value={github_url} onChange={(e) => setGithubUrl(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="github_token">Github Access Token</Label>
              <Input id="github_token" placeholder="ghp_..." type="password" value={github_token} onChange={(e) => setGithubToken(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground absolute bottom-0 mb-2 right-0 mr-2">e.g: https://github.com/username/repo/blob/main/path/to/file.lua</p>
          </div>
				</Step>
        <Step label={"Miscellaneous"}>
          <div className="h-40 flex flex-row gap-3 items-center justify-center my-2 border bg-secondary text-primary rounded-md relative">
            <div className="flex flex-col space-y-1.5 text-center">
              <Label htmlFor="script_type">Script Type</Label>
              <Select onValueChange={(value) => setScriptType(value as "paid" | "free-paywall")} value={script_type}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="free-paywall">Freemium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5 text-center">
              <Label htmlFor="discord_link">Discord Link (optional)</Label>
              <Input id="discord_link" placeholder="Short description of your script" value={discord_link} onChange={(e) => setDiscordLink(e.target.value)} />
            </div>
            
            <div className="flex flex-col space-y-1.5 text-center absolute bottom-0 right-0">
              <p className="text-xs text-muted-foreground">e.g: https://discord.gg/invite</p>
            </div>
          </div>
				</Step>
				<Footer callback={CreateProject} reset_callback={reset} disable_reset={is_submitting} is_first_time={is_first_time} />
			</Stepper>
		</div>
	);
}

const Footer = ({callback, reset_callback, disable_reset, is_first_time}: {callback: () => void, reset_callback: () => void, disable_reset: boolean, is_first_time: boolean}) => {
	const {
		nextStep,
		prevStep,
		resetSteps,
		hasCompletedAllSteps,
		isLastStep,
		isOptionalStep,
		isDisabledStep,
	} = useStepper();

  const router = useRouter();

	return (
		<>
			{hasCompletedAllSteps && (
				<div className="h-40 flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md">
					<h1 className="text-xl">Wohoo! You created your {is_first_time ? "first" : ""} script! 🎉</h1>
          <p className="text-xs text-muted-foreground mt-5">You can now go to the dashboard and start using upioguard on your script.</p>
          <Confetti className="absolute top-0 right-0 w-screen h-screen pointer-events-none"/>
          <Link href="/dashboard" onClick={() => { if (is_first_time) { window.location.reload() } else {router.push("/dashboard")} }}>
            <Button variant={"outline"} className="mt-2">
              Go to dashboard
            </Button>
          </Link>
				</div>
			)}
			<div className="w-full flex justify-end gap-2">
				{hasCompletedAllSteps ? (
					<Button size="sm" disabled={disable_reset} onClick={() => {
              reset_callback();
              resetSteps();
            }}>
						Reset
					</Button>
				) : (
					<>
						<Button
							disabled={isDisabledStep}
							onClick={prevStep}
							size="sm"
							variant="secondary"
						>
							Prev
						</Button>
						<Button size="sm" onClick={() => {
              nextStep();

              if (isLastStep) {
                callback();
              }
            }}>
							{isLastStep ? "Finish" : isOptionalStep ? "Skip" : "Next"}
						</Button>
					</>
				)}
			</div>
		</>
	);
};