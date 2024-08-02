"use client";

import { Step, type StepItem, Stepper, useStepper } from "@/components/stepper";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const steps = [
	{ label: "Discord" },
	{ label: "Key Settings" },
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
import { useProjectData } from "../../components/project_data_provider";
import { toast } from "sonner";

import { AlertDialogCancel } from "@/components/ui/alert-dialog";

export default function KeyCreationStepper({set_open, refresh}: { set_open: (is_open: boolean) => void, refresh: () => void}) {

  const {data} = useProjectData();

  const [key_type, setKeyType] = React.useState<"temporary" | "permanent" | "checkpoint">("temporary");
  const [key_expires, setKeyExpires] = React.useState<Date>();

  const [note, setNote] = React.useState("");

  const [discord_username, setDiscordUsername] = React.useState("");
  const [discord_userid, setDiscordUserid] = React.useState("");

	return (
		<div className="flex flex-col gap-4 mt-5">
			<Stepper initialStep={0} steps={steps}>
        <Step label={"Discord"}>
          <div className="h-40 flex items-center justify-center my-2 gap-2 border bg-secondary text-primary rounded-md">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Discord Username</Label>
              <Input id="name" placeholder="username of the discord account" value={discord_username} onChange={(e) => setDiscordUsername(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="user id">Discord User ID</Label>
              <Input id="user id" placeholder="Snowflake ID of the discord account" value={discord_userid} onChange={(e) => setDiscordUserid(e.target.value)} />
            </div>
          </div>
				</Step>
        <Step label={"Key Settings"}>
          <div className="h-40 flex flex-row gap-3 items-center justify-center my-2 border bg-secondary text-primary rounded-md relative">
            <div className="flex flex-col space-y-1.5 text-center">
              <Label htmlFor="script_type">Key Type</Label>
              <Select onValueChange={(value) => setKeyType(value as "temporary" | "permanent" | "checkpoint")} value={key_type}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  {data.project_type === "free-paywall" && <SelectItem value="checkpoint">Checkpoint</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {key_type === "temporary" && <div className="flex flex-col space-y-1.5 text-center">
              <Label htmlFor="key_expires">Key Expires</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !key_expires && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {key_expires ? format(key_expires, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={key_expires}
                    onSelect={setKeyExpires}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>}
            
            <div className="flex flex-col space-y-1.5 text-center">
              <Label htmlFor="note">Note</Label>
              <Input id="note" placeholder="Note for this key" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

          </div>
				</Step>
        <Footer callback={() => {
          if (key_type == "temporary" && !key_expires) {
            toast.error("Key expires is required for temporary keys");
            return;
          }

          if (!discord_username || !discord_userid) {
            toast.error("Discord username and user ID are required");
            return;
          }

          const promise = fetch(`/api/script/${data.project_id}/manage/key/create`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              discord_id: discord_userid,
              username: discord_username,
              note: note,
              key_expires: key_expires,
              key_type: key_type,
            }),
          });

          set_open(false);
          toast.promise(promise, {
            loading: "Creating key...",
            success: () => {
              refresh();
              setKeyExpires(undefined);
              setNote("");
              setDiscordUsername("");
              setDiscordUserid("");
              return "Key created successfully!";
            },
            error: "Failed to create key",
          });
        }} />
			</Stepper>
		</div>
	);
}

const Footer = ({callback}: {callback: () => void}) => {
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
		<div className="flex flex-row gap-2">
			<div className="w-full flex justify-start gap-2">
				{hasCompletedAllSteps ? (
					<Button size="sm" onClick={() => {
              resetSteps();
            }}>
						Close
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

      <div className="w-full flex justify-end gap-2">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
      </div>
		</div>
	);
};