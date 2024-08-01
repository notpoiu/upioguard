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
    <main className="overflow-x-visible">
      <Card className="w-[full]">
        <CardHeader>
          <CardTitle>Script Keys</CardTitle>
          <CardDescription>Create and manage keys for your script</CardDescription>
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