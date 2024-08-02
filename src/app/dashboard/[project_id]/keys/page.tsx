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
import { Key } from "@/db/schema";
import { useEffect, useState } from "react";
import { get_script_keys } from "../../server";

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

  const [keyData, setKeyData] = useState<Key[]>([]);
  const [refresh, setRefresh] = useState(1);

  const refreshData = () => {
    setRefresh(refresh + 1);
  }

  useEffect(() => {
    get_script_keys(params.project_id).then((data) => {
      setKeyData(data as Key[]);
    });
  }, [refresh]);

  return (
    <main className="overflow-x-visible">
      <Card className="w-[full]">
        <CardHeader>
          <CardTitle>Script Keys</CardTitle>
          <CardDescription>Create and manage keys for your script</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={keyData} refresh={refreshData} />
        </CardContent>
      </Card>
    </main>
  )
}