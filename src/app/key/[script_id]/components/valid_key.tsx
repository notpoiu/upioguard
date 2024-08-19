"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon, KeyIcon, SubscriptIcon } from "lucide-react";
import { parse } from "path";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function KeyInput({ upioguard_key, project_id }: { upioguard_key: string, project_id: string }) {

  return (
    <div className="flex flex-row space-x-2">
      <Input id="key" value={upioguard_key} readOnly />
      <Button size={"icon"} variant={"outline"} onClick={() => {
        navigator.clipboard.writeText(upioguard_key);
        toast.success("Copied Key to clipboard successfully!");
      }}>
        <KeyIcon />
      </Button>

      <Button size={"icon"} variant={"outline"} onClick={() => {
        navigator.clipboard.writeText(`_G.ug_key = "${upioguard_key}"
loadstring(game:HttpGet("${origin}/scripts/loaders/${project_id}.lua"))()`);
        toast.success("Copied script to clipboard successfully!");
      }}>
        <CopyIcon />
      </Button>
    </div>
  )
}
