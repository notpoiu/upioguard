"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { verify_turnstile } from "../key_server";
import { useRouter } from "next/navigation";

export function Checkpoint({ env, currentCheckpointIndex, checkpointurl, project_id, minimum_checkpoint_switch_duration }: { env: string, currentCheckpointIndex: number, checkpointurl: string, project_id: string, minimum_checkpoint_switch_duration: string }) {
  const [captchaToken, setCaptchaToken] = React.useState<string>();

  const router = useRouter();

  return (
    <main>
      {!captchaToken && (
        <div className="flex justify-center items-center flex-col">
          <p>Please complete the captcha below to continue</p>
          <Turnstile siteKey={env == "production" ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA" : "1x00000000000000000000AA"}
            onSuccess={setCaptchaToken}
            onError={toast.error}
            onExpire={() => toast.error("Captcha expired")}
          />
        </div>
      )}
      
      {captchaToken && (
        <BlurFade inView duration={0.2} className="flex justify-center items-center">
          <Button onClick={() => {
            verify_turnstile(checkpointurl, project_id, captchaToken).then((is_valid) => {
              setTimeout(() => {
                router.push(checkpointurl);
              }, 1000);
            });
          }}>
            Go to checkpoint {currentCheckpointIndex + 1}
          </Button>
        </BlurFade>
      )}
    </main>
  )
}