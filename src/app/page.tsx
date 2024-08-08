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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NumberTicker from "@/components/magicui/number-ticker";
import { MagicCard } from "@/components/magicui/magic-card";

import { db } from "@/db";
import { admins } from "@/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Marquee from "@/components/magicui/marquee";

const reviews = [
  {
    name: "deivid",
    username: "@deividcomsono",
    body: "Makes your whitelist easier but dosen't even obfuscate, dont use that shit 🔥",
    img: "/reviewpfps/deivid.png",
  },
  {
    name: "chrono",
    username: "@notchron",
    body: "its open source so you can add shit urself you lazy bum",
    img: "/reviewpfps/chrono.png",
  },
  {
    name: "mstudio45",
    username: "@mstudio45",
    body: "damn this shit is clean 🔥",
    img: "/reviewpfps/mstudio45.ico",
  },
  {
    name: "ense",
    username: "@ense._",
    body: "opensource so its immediatly better than anything else on the market",
    img: "/reviewpfps/ense.ico",
  },
  {
    name: "Master Oogway",
    username: "@realmasteroogway",
    body: "Upioguard makes whitelisting too easy, I'm using it for my hub and it is great! 🐢",
    img: "/reviewpfps/oogway.png",
  }
];
 
const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <Image className="rounded-full" width={32} height={32} alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export default async function Home() {
  const session = await auth();

  let does_exist = false;

  if (session?.user && session?.user?.id) {
    const does_exist_db_query = await db
      .select()
      .from(admins)
      .where(eq(admins.discord_id, session.user.id));

    does_exist = does_exist_db_query.length > 0;
  }

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
                <GitHubLogoIcon className="mr-1 size-3" />
                <span>upioguard is open source</span>
              </AnimatedShinyText>
            </div>
          </div>
        </Link>
      </BlurFade>

      <BlurFade inView className="z-30">
        <h1 className="text-6xl leading-relaxed font-bold magic-text z-30">
          upioguard
        </h1>
      </BlurFade>
      <BlurFade delay={0.25} inView className="z-10">
        <p className="text-lg z-10">
          the next generation of luau script protection
        </p>
      </BlurFade>

      <div className="mt-5 mb-5" />

      <BlurFade delay={0.5} inView>
        <ShineBorder
          className="relative flex h-fit max-h-[500px] max-w-[800px] w-[90vw] flex-col items-center justify-center overflow-hidden rounded-lg border md:shadow-xl bg-[#09090B]"
          color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
          <Image
            src="/dashboard.png"
            alt="dashboard"
            width={1080}
            height={720}
            className="z-10 object-contain w-full max-h-[500px] h-full"
          />
        </ShineBorder>
      </BlurFade>

      <div className="mt-10 mb-5" />

      <BlurFade delay={0.75} inView>
        <div className="max-w-[90vw] flex flex-wrap gap-5 justify-center">
          <BlurFade delay={0.75} inView>
            <MagicCard className="cursor-pointer max-w-[300px] flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl min-h-[2.25rem]">
              <CardHeader className="flex justify-center items-center flex-col">
                <CardDescription>Cost of selfhosting</CardDescription>
                <NumberTicker
                  delay={1}
                  value={100}
                  className="text-3xl"
                  suffix="%"
                  prefix="-"
                />
              </CardHeader>
            </MagicCard>
          </BlurFade>

          <BlurFade delay={1} inView>
            <MagicCard className="cursor-pointer max-w-[300px] flex-col items-center justify-center shadow-2xl whitespace-nowrap text-4xl">
              <CardHeader className="flex justify-center items-center flex-col">
                <CardDescription>Initial Setup Time</CardDescription>
                <NumberTicker
                  delay={1}
                  value={8}
                  className="text-3xl"
                  suffix=" min"
                  prefix="~"
                />
              </CardHeader>
            </MagicCard>
          </BlurFade>
        </div>
      </BlurFade>

      <BlurFade delay={1} inView className="w-screen fle flex-col justify-center items-center mt-[20vw] px-10">
        <BlurFade delay={1.25} inView className="w-screen flex justify-center items-center">
          <h1 className="text-2xl leading-relaxed font-bold mb-5">
            Here&apos;s what people say about <span className="magic-text">upioguard</span>
          </h1>
        </BlurFade>
        <BlurFade delay={1.5} inView className="w-full flex justify-center items-center">
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background md:shadow-xl">
            <Marquee className="[--duration:20s]">
              {reviews.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
          </div>
        </BlurFade>

      </BlurFade>
      {!session && !does_exist && (
        <form
          action={async () => {
            "use server";
            cookies().set("upioguard-signintype", "dashboard");
            await signIn("discord", {
              redirectTo: "/dashboard",
            });
          }}
        >
          <Button className="fixed top-0 right-0 mt-2 mr-2">Login</Button>
        </form>
      )}

      {session && does_exist && (
        <div className="flex flex-row items-center justify-center fixed top-0 right-0 mt-2 mr-2">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button>Logout</Button>
          </form>

          <Link href="/dashboard">
            <Button variant={"outline"}>Go to dashboard</Button>
          </Link>
        </div>
      )}
    </main>
  );
}
