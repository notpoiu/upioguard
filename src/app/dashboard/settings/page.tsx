import { auth } from "@/auth";
import { delete_account, get_projects_owned_by_user } from "../server";
import { PageContainer } from "@/components/ui/page-container";
import { User } from "next-auth";
import Project_Navbar from "../components/projects_navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import RelinkDiscord from "./components/relink_discord";
import { Button } from "@/components/ui/button";
import ApiKeysSettings from "./components/api_keys_settings";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DeleteAccount from "./components/delete_account";

export default async function SettingsPage() {
  const session = await auth();
  const project_data = await get_projects_owned_by_user();

  return (
    <div className="flex flex-row max-sm:flex-col overflow-x-hidden">
      <Project_Navbar user={session?.user as User} projects={project_data} />
      <PageContainer className="justify-start flex-col">
        <main>
          <Tabs defaultValue="account" orientation="horizontal">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="developer">Developer Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Username</CardTitle>
                  <CardDescription>
                    The linked discord username of your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{session?.user?.name}</p>
                </CardContent>
              </Card>

              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>Email</CardTitle>
                  <CardDescription>
                    The linked email from discord (hover to reveal)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="blur-sm hover:blur-none transition-all">
                    {session?.user?.email}
                  </p>
                </CardContent>
              </Card>

              <Card className="mt-5 min-h-[8rem]">
                <CardHeader className="relative">
                  <CardTitle>Avatar</CardTitle>
                  <CardDescription>
                    This is your avatar from discord
                  </CardDescription>

                  <Avatar className="w-24 h-24 absolute right-0 top-2 mr-5">
                    <AvatarImage
                      src={session?.user?.image ?? ""}
                      alt={`@${session?.user?.name}`}
                    />
                    <AvatarFallback>
                      {session?.user?.name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </CardHeader>
              </Card>

              <RelinkDiscord />

              <DeleteAccount />
            </TabsContent>
            <TabsContent value="developer">
              <ApiKeysSettings projects={project_data} />
            </TabsContent>
          </Tabs>
        </main>
      </PageContainer>
    </div>
  );
}
