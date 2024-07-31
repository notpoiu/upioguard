"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import React from "react";

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import CopyPasteButton from "../components/copy_component";

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


import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner";

/*
  const { 
    discord_id,
    username,
    note,
    key_expires,
    key_type
  } = await req.json();
*/

export default function Keys() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [key_type, setKeyType] = React.useState<"temporary" | "permanent" | "checkpoint">("temporary");
  const [note, setNote] = React.useState<string>("");
  const [expires, setExpires] = React.useState<Date>(new Date());
  const [discord_user_id, setDiscordUserId] = React.useState<string>("");
  const [username, setUsername] = React.useState<string>("");

  const [key, setKey] = React.useState<string>("");

  return (
    <main>
      <h1 className="text-3xl font-bold">Keys</h1>
      <p>Create Keys</p>

      <Card className="w-[350px] mt-5">
        <CardHeader>
          <CardTitle>Create Key</CardTitle>
          <CardDescription>Create a key for a user to use</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="discord_user_id">Discord User ID</Label>
              <Input id="name" placeholder="Discord User ID of the user" value={discord_user_id} onChange={(e) => setDiscordUserId(e.target.value)} />
            </div>
            <div className="flex flex-col space-y-1.5"> 
              <Label htmlFor="username">Discord Username</Label>
              <Input id="username" placeholder="Discord Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>

            <div className="flex flex-col space-y-1.5"> 
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            {key_type == "temporary" && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="key_expires">Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !expires && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expires ? format(expires, "PPP") : <span>Pick a expiry date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expires}
                      onSelect={(day) => setExpires(day as Date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="key_type">Key Type</Label>
              <Select onValueChange={(value) => setKeyType(value as "temporary" | "permanent" | "checkpoint")} value={key_type}>
                <SelectTrigger id="key_type">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper" key={refresh_key+1}>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  {data?.project_type == "free-paywall" && <SelectItem value="checkpoint">Checkpoint (Linkvertise)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button onClick={()=> {
                setIsSubmitting(true);
                fetch(window.location.origin + "/api/key/create", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    discord_id: discord_user_id,
                    username: username,
                    note: note,
                    key_expires: expires.toISOString(),
                    key_type: key_type,
                  }),
                }).then((res) => res.json()).then((res) => {
                  if (!res.key) {
                    toast.error("Failed to create key");
                    setIsSubmitting(false);
                    setKey(JSON.stringify(res));
                    return;
                  }

                  toast.success("Key created successfully!");
                  setKey(res.key);
                  setIsSubmitting(false);
                }).catch((err) => {
                  toast.error(err);
                  setIsSubmitting(false);

                  setKey("There was an error creating the key, please try again later.");
                });
              }} disabled={isSubmitting}>
                {isSubmitting ? "Creating Key..." : "Create Key"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Key Created!</AlertDialogTitle>
                <AlertDialogDescription>
                  A key has been created successfully. You can now use it for your script.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="relative bg-secondary text-primary rounded-md p-3 my-2 min-h-[5rem]">
                <CopyPasteButton text={key} className="absolute top-0 right-0 mt-2 mr-2" />
                <span className="max-w-[30rem] text-wrap">{key}</span>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Dismiss</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </main>
  )
}