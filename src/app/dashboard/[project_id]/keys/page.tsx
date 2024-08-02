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
import { useEffect, useState } from "react";
import { get_script_keys } from "../../server";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { mkConfig, generateCsv, download } from "export-to-csv";
import { Key } from "lucide-react";

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

  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");

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
          <DataTable data={keyData} refresh={refreshData}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Export Keys</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Export Keys</AlertDialogTitle>
                <AlertDialogDescription>
                  Export keys for this project in different formats
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <Select onValueChange={(value) => setExportFormat(value as "json" | "csv")} value={exportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Export Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => {
                  const data_to_export = keyData.map((key) => {
                    let returnKey = key as any;
                    delete returnKey["project_id"];
                    return returnKey;
                  });

                  if (exportFormat === "json") {
                    const json = JSON.stringify(data_to_export);
                    
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "keys.json";
                    a.click();
                    URL.revokeObjectURL(url);
                    a.remove();
                  }

                  if (exportFormat === "csv") {
                    const csvConfig = mkConfig({ useKeysAsHeaders: true });
                    download(csvConfig)(generateCsv(csvConfig)(data_to_export as []))
                  }
                }}>Export All Keys</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </DataTable>
        </CardContent>
      </Card>
    </main>
  )
}