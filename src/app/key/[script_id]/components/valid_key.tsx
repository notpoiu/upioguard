"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";
import { parse } from "path";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function KeyInput({ upioguard_key, children }: { upioguard_key: string, children: React.ReactNode }) {

  return (
    <div className="flex flex-row space-x-2">
      {children}
      <Button size={"icon"} variant={"outline"} onClick={() => {
        navigator.clipboard.writeText(upioguard_key);
        toast.success("Copied to clipboard successfully!");
      }}>
        <CopyIcon />
      </Button>
    </div>
  )
}
