"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RateLimit({ minimum_checkpoint_switch_duration, old_link }: { minimum_checkpoint_switch_duration: string, old_link?: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center">
      <p className="text-muted-foreground text-sm">
        Something went wrong, maybe you came back to this page too fast (minimum {minimum_checkpoint_switch_duration} seconds between checkpoints)
      </p>

      {old_link == undefined ? <Button className="mt-2" onClick={() => { window.location.reload() }}>Retry</Button> : <Link href={old_link}><Button className="mt-2">Try checkpoint again</Button></Link>}
    </div>
  );
}