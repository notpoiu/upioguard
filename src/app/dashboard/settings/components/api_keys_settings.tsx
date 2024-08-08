"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
} from "@/components/ui/alert-dialog"
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Project, ProjectApiKey } from "@/db/schema";
import React from "react";
import { toast } from "sonner";
import { create_api_key, delete_api_keys, get_api_keys_from_projects_owned_by_user } from "../../server";
import { DataTable } from "./api_keys_table/data-table";

export default function ApiKeysSettings({projects}: {projects: Project[]}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState<any>({});
  const [key_generated, setKeyGenerated] = React.useState(false);

  const [key, setKey] = React.useState("");

  const [key_name, setKeyName] = React.useState("");
  const [project_id, setProjectId] = React.useState("");

  function CreateKey() {
    if (key_name == "" || project_id == "") {
      toast.error("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    toast.promise(create_api_key(project_id, key_name), {
      loading: "Creating Key...",
      success: (data) => {
        setKey(data);
        setIsSubmitting(false);
        setKeyGenerated(true);

        refreshData();

        return "Key created successfully!";
      },
      error: (err) => `Failed to create key: ${err}`,
    });
  }

  const [api_keys, setApiKeys] = React.useState<ProjectApiKey[]>([]);
  const [refresh, setRefresh] = React.useState(1);

  const refreshData = () => {
    setRefresh(refresh + 1);
  }

  React.useEffect(() => {
    get_api_keys_from_projects_owned_by_user().then((data) => {
      setApiKeys(data);
    });
  }, [refresh]);

  function reset() {
    setKey("");
    setKeyName("");
    setProjectId("");
    setIsSubmitting(false);
    setKeyGenerated(false);
  }

  const table = DataTable({refresh: refreshData, data: api_keys, setRowSelection, rowSelection});

  return (
    <Card className="mt-5">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Create and manage your API keys</CardDescription>
      </CardHeader>
      <CardContent>
        <table.table />
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>Create a new API key</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>API Key Options</AlertDialogTitle>
              <AlertDialogDescription>
                You can create a new API key here. This will allow you to use the REST API from your own application like a discord bot.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {key_generated && (
              <p>Your API key is: <code>`{key}`</code></p>
            )}
            {!key_generated && (
              <div className="flex flex-row gap-2 justify-center items-center">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Name</Label>
                  <Input placeholder="Name of the API key" value={key_name} onChange={(e) => setKeyName(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm">Scripts</Label>
                  <Select onValueChange={(value) => setProjectId(value as string)} value={project_id}>
                    <SelectTrigger id="key_type"  className="w-[180px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={"all"}>All Scripts</SelectItem>
                      {projects.map((project, index) => (
                        <SelectItem key={index} value={project.project_id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {!key_generated && (
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => reset()}>Cancel</AlertDialogCancel>
                <Button disabled={isSubmitting} onClick={CreateKey}>Create</Button>
              </AlertDialogFooter>
            )}

            {key_generated && (
              <AlertDialogFooter>
                <Button onClick={() => {navigator.clipboard.writeText(key); toast.success("API key copied to clipboard")}}>Copy to clipboard</Button>
                <AlertDialogCancel onClick={() => reset()}>Close</AlertDialogCancel>
              </AlertDialogFooter>
            )}
          </AlertDialogContent>
        </AlertDialog>
        
        {rowSelection && Object.keys(rowSelection).length > 0 && (
          <div className="flex flex-row gap-2 justify-center items-center ml-auto">
            <p className="text-sm">Selected {Object.keys(rowSelection).length} key{Object.keys(rowSelection).length > 1 ? "s" : ""}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant={"destructive"}>Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete API Keys</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the selected API keys?
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    delete_api_keys(table.tableData.getSelectedRowModel().rows.map((row) => row.original));

                    setRowSelection({});
                    refreshData();
                  }}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}