import { auth, signIn, signOut } from "@/auth";
import BlurFade from "@/components/magicui/blur-fade";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import ShineBorder from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/magicui/animated-shiny-text";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

import "./gradient.css";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import NumberTicker from "@/components/magicui/number-ticker";
import { MagicCard } from "@/components/magicui/magic-card";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-col items-center justify-center w-screen py-10">

      <BlurFade inView className="z-30">
        <Link href={"https://github.com/notpoiu/upioguard"} target="_blank">
          <div className="z-10 flex items-center justify-center mt-10 mb-2">
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800",
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <GitHubLogoIcon className="mr-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                <span>upioguard is open source</span>
              </AnimatedShinyText>
            </div>
          </div>
        </Link>
      </BlurFade>

      <BlurFade inView className="z-30">
        <h1 className="text-6xl leading-relaxed font-bold magic-text z-30">upioguard</h1>
      </BlurFade>
      <BlurFade delay={0.25} inView className="z-10">
        <p className="text-lg z-10">the next generation of luau script protection</p>
      </BlurFade>

      <div className="mt-5 mb-5" />

      <BlurFade delay={0.5} inView>
        <ShineBorder
          className="relative flex h-fit max-h-[500px] max-w-[800px] w-[90vw] flex-col items-center justify-center overflow-hidden rounded-lg border md:shadow-xl bg-[#09090B]"
          color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
          <Image src="/dashboard.png" alt="dashboard" width={1080} height={720} className="z-10 object-contain w-full max-h-[500px] h-full" />
        </ShineBorder>
      </BlurFade>

      <div className="mt-10 mb-5" />

      <BlurFade delay={0.75} inView>
          <div className="max-w-[90vw] flex flex-wrap gap-5 justify-center">
            
            
            <BlurFade delay={0.75} inView>
              <MagicCard
                className="cursor-pointer max-w-[300px] flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
              >
                <CardHeader className="flex justify-center items-center flex-col">
                    <CardDescription>Cost of selfhosting</CardDescription>
                    <NumberTicker delay={1} value={100} className="text-3xl" suffix="%" prefix="-" />
                  </CardHeader>
              </MagicCard>
            </BlurFade>

            <BlurFade delay={1} inView>
              <MagicCard
                className="cursor-pointer max-w-[300px] flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl"
              >
                <CardHeader className="flex justify-center items-center flex-col">
                  <CardDescription>Initial Setup Time</CardDescription>
                  <NumberTicker delay={1.25} value={8} className="text-3xl" suffix=" min" prefix="~" />
                </CardHeader>
              </MagicCard>
            </BlurFade>
          </div>
      </BlurFade>
      {!session && (
        <form action={async () => {
          "use server";
          await signIn("discord", {redirectTo: "/dashboard"});
        }}>
          <Button className="fixed top-0 right-0 mt-2 mr-2">Login</Button>
        </form>
      )}

      {session && (
        <div className="flex flex-row items-center justify-center fixed top-0 right-0 mt-2 mr-2">
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <Button>Logout</Button>
          </form>

          <Link href="/dashboard">
            <Button variant={"outline"}>
              Go to dashboard
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
