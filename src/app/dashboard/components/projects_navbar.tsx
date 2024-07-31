"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HamburgerMenuIcon} from "@radix-ui/react-icons";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import React from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { User } from "next-auth";
import { BarChart2Icon, Home } from "lucide-react";
import { Project } from "@/db/schema";


export const presence_colors: {[key: string]: string} = {
  "dnd": "#f04747",
  "online": "#23a55a",
  "offline": "#80848e",
  "idle": "#f0b232"
}

export default function Project_Navbar({ user, projects }: { user: User, projects: Project[] }) {

  const pages = [
    { name: "Home", link: "/dashboard", icon: <Home/> },
  ]

  projects.forEach((project) => {
    pages.push({ name: project.name, link: `/dashboard/${project.project_id}`, icon: <BarChart2Icon/> })
  })

  const currentPage = usePathname();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  return (
      <>
          <div className="max-md:flex hidden flex-row fixed top-2 left-2">
              <p>upioguard</p>
              <Sheet open={isSheetOpen} onOpenChange={(open) => {setIsSheetOpen(open)}}>
                  <SheetTrigger><HamburgerMenuIcon className="ml-2" /></SheetTrigger>
                  <SheetContent side={"left"} className="max-w-[15rem]">
                      <SheetHeader>
                          <SheetTitle>upioguard</SheetTitle>
                          <SheetDescription>
                              Navigation menu
                          </SheetDescription>
                      </SheetHeader>

                      <div className="flex flex-col justify-center md:justify-start *:mb-2 w-full mt-4">
                          {pages.map((page, index) => (
                              <Link key={index} href={page.link} className="flex flex-row justify-center md:justify-start items-center" onClick={() => {
                                  setIsSheetOpen(false);
                              }}>
                                  {page.icon}
                                  <p className={`${currentPage === page.link ? "font-bold" : ""} ml-4`}>{page.name}</p>
                              </Link>
                          ))}
                      </div>
                      
                      <div className="w-full justify-center items-center flex">
                          <div className="rounded border border-border px-2 mb-3 absolute bottom-0">
                              <div className="flex-row flex items-center">
                                  <div className="flex flex-row px-2 py-2 justify-center items-center">
                                      <Link href={`https://discord.com/users/${user.id}`} target="_blank">
                                          <svg width="55" height="55" viewBox="0 0 92 92" aria-hidden="true">
                                              <foreignObject x="0" y="0" width="80" height="80">
                                                  <img src={user.image ?? ""} alt=" " aria-hidden="true"  style={{"borderRadius": "999px"}} />
                                              </foreignObject>
                                              <rect width="16" height="16" x="60" y="60" fill={presence_colors["online"]} rx={50}></rect>
                                          </svg>
                                      </Link>
                                      <div className="flex flex-col ml-1 justify-center">
                                          <p className="font-semibold">{user.name}</p>
                                          <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden max-w-[4rem] text-nowrap "><span className="blur-sm">{user.email?.split("@")[0]}</span>@{user.email?.split("@")[1]}</p>
                                      </div>
                                  </div>
                                  <ModeToggle className="ml-3"  />
                              </div>
                          </div>
                      </div>
                          
                  </SheetContent>
              </Sheet>

          </div>
          <nav className="sticky top-0 left-0 flex flex-col items-center px-3 min-w-[15rem] max-w-[15rem] max-md:hidden min-h-screen border-r border-border/90 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <p className="mt-2 mb-2 text-lg font-bold">upioguard</p>
              <div className="flex flex-col justify-start mr-2 *:mb-2 w-full">
                  {pages.map((page, index) => (
                      <Link key={index} href={page.link} className="flex flex-row justify-start items-center ml-[1.5rem]">
                          {page.icon}
                          <p className={`${currentPage === page.link ? "font-bold" : ""} ml-4`}>{page.name}</p>
                      </Link>
                  ))}
              </div>

              <div className="rounded border border-border justify-center items-center flex-row flex px-2 mb-3 mt-auto">
                  <div className="flex flex-row px-2 py-2 justify-center items-center">
                      <Link href={`https://discord.com/users/${user.id}`} target="_blank">
                          <svg width="55" height="55" viewBox="0 0 92 92" aria-hidden="true">
                              <foreignObject x="0" y="0" width="80" height="80">
                                  <img src={user.image ?? ""} alt=" " aria-hidden="true"  style={{"borderRadius": "999px"}} />
                              </foreignObject>
                              <rect width="16" height="16" x="60" y="60" fill={presence_colors["online"]} rx={50}></rect>
                          </svg>
                      </Link>
                      <div className="flex flex-col ml-1 justify-center">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-muted-foreground text-ellipsis overflow-hidden max-w-[4rem] text-nowrap "><span className="blur-sm">{user.email?.split("@")[0]}</span>@{user.email?.split("@")[1]}</p>
                      </div>
                  </div>
                  <ModeToggle className="ml-3"  />
              </div>
          </nav>
      </>
  )
}