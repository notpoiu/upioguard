"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
import React, { useEffect } from "react";
import { toast } from "sonner";

export function Checkpoint({ env, currentCheckpointIndex, checkpointurl }: { env: string, currentCheckpointIndex: number, checkpointurl: string }) {
  const [captchaToken, setCaptchaToken] = React.useState<string>();

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
          <Link href={checkpointurl}>
            <Button onClick={() => {
              
            }}>
              Go to checkpoint {currentCheckpointIndex + 1}
            </Button>
          </Link>
        </BlurFade>
      )}
    </main>
  )
}