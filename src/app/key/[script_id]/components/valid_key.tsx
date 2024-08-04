"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyIcon } from "lucide-react";
import { parse } from "path";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function KeyInput({ key }: { key?: string }) {

  const [backup_key, setBackupKey] = useState<string>("");

  function parse_cookies(cookies: string) {
    let data: any = {};
    const cookies_array = decodeURIComponent(cookies).split(";").map(cookie => cookie.trim());
    cookies_array.forEach(cookie => {
      const [key, value] = cookie.split("=");
      data[key] = value;
    });

    return data;
  }

  useEffect(() => {
    const cookies = parse_cookies(document.cookie);

    if (cookies["upioguard-server-keysystem"]) {
      const key = JSON.parse(cookies["upioguard-server-keysystem"]).key;
      setBackupKey(key);
    }
  }, [])


  return (
    <div className="flex flex-row space-x-2">
      <Input id="key" value={key ?? backup_key} readOnly />
      <Button size={"icon"} variant={"outline"} onClick={() => {
        navigator.clipboard.writeText(key ?? backup_key);
        toast.success("Copied to clipboard successfully!");
      }}>
        <CopyIcon />
      </Button>
    </div>
  )
}
