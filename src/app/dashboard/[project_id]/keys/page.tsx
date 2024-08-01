"use client";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useProjectData } from "../components/project_data_provider";
import { DataTable } from "./tables/key_data_table";
import { columns, sample_key_data } from "./tables/table_types";

/*
  const { 
    discord_id,
    username,
    note,
    key_expires,
    key_type
  } = await req.json();
*/

export default function Keys({params}: {params: {project_id: string}}) {
  const { data } = useProjectData();

  return (
    <main className="justify-center flex flex-col items-center w-full h-screen">
      <Card className="w-[full]">
        <CardHeader className="relative">
          <CardTitle>Script Keys</CardTitle>
          <CardDescription>Create and manage keys for your script</CardDescription>

          <Button className="absolute right-[1.5rem] top-[1.5rem]">
            Export All Key Data
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={sample_key_data} />
        </CardContent>
        <CardFooter>
        </CardFooter>
      </Card>
    </main>
  )
}