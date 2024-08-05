"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ClipboardIcon, KeyIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

export default function HowToExecute({project_id}: {project_id: string}) {
  const [origin, setOrigin] = React.useState("http://localhost:3000");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <Card className="mt-5 max-w-[500px]">
        <CardHeader>
          <CardTitle>Script Loader</CardTitle>
          <CardDescription>This is how your users will load your script</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto px-5 py-5 border rounded-md w-full">
            <code>
              _G.ug_key = &quot;put_key_here&quot;<br />
              loadstring(game:HttpGet(&quot;{origin}/scripts/loaders/{project_id}.lua&quot;))()
            </code>
          </pre>
        </CardContent>
        <CardFooter className="justify-end">
          <Link href={`/key/${project_id}`} target="_blank">
            <Button className="mr-2" size={"icon"}>
              <KeyIcon />
            </Button>
          </Link>
          <Button size={"icon"} onClick={() => {
            navigator.clipboard.writeText(`_G.ug_key = "put_key_here"
loadstring(game:HttpGet("${origin}/scripts/loaders/${project_id}.lua"))()`);
            toast.success("Copied to clipboard!");
          }}><ClipboardIcon /></Button>
        </CardFooter>
      </Card>
  )
}