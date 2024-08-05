"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { set_cookie_turnstile } from "../key_server";
import { useRouter } from "next/navigation";

export function Checkpoint({ env, currentCheckpointIndex, checkpointurl }: { env: string, currentCheckpointIndex: number, checkpointurl: string }) {
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
            set_cookie_turnstile(captchaToken, checkpointurl).then(() => {
              console.log("Set cookie successfully");
              router.push(checkpointurl);
            });
          }}>
            Go to checkpoint {currentCheckpointIndex + 1}
          </Button>
        </BlurFade>
      )}
    </main>
  )
}