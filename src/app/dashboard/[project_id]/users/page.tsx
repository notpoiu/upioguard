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
import { KeyDataTable } from "./tables/key_data_table";
import { use, useEffect, useState } from "react";
import { get_script_bans, get_script_keys } from "../../server";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { format } from "date-fns"

import { mkConfig, generateCsv, download } from "export-to-csv";
import { BannedUser, Key } from "@/db/schema";
import { ScriptBlacklistDataTable } from "./tables/script_blacklist_table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

  const [script_ban_data, setScriptBanData] = useState<BannedUser[]>([]);
  const [script_ban_refresh, setScriptBanRefresh] = useState(1);

  const [newBanHWID, setNewBanHWID] = useState("");
  const [newBanReason, setNewBanReason] = useState("");
  const [expiration, setExpiration] = useState<"permanent" | "temporary">("permanent");
  const [expirationDate, setExpirationDate] = useState<Date>();

  useEffect(() => {
    get_script_bans(params.project_id).then((data) => {
      setScriptBanData(data as BannedUser[]);
    });
  }, [script_ban_refresh]);

  const refreshScriptBanData = () => {
    setScriptBanRefresh(script_ban_refresh + 1);
  }

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
      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">Script Keys</TabsTrigger>
          <TabsTrigger value="blacklist">Script Blacklist</TabsTrigger>
        </TabsList>
        <TabsContent value="keys">
          <Card className="w-[full]">
            <CardHeader>
              <CardTitle>Script Keys</CardTitle>
              <CardDescription>Create and manage bans for your script</CardDescription>
            </CardHeader>
            <CardContent>
              <KeyDataTable data={keyData} refresh={refreshData}>
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
              </KeyDataTable>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="blacklist">
          <Card className="w-[full]">
            <CardHeader>
              <CardTitle>Script Blacklist</CardTitle>
              <CardDescription>Create and manage blacklisted users for your script</CardDescription>
            </CardHeader>
            <CardContent>
              <ScriptBlacklistDataTable data={script_ban_data} refresh={refreshScriptBanData}>
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="destructive">Blacklist</Button></AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Blacklist User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Blacklists a user from using your script
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="hwid">HWID</Label>
                      <Input id="hwid" placeholder="HWID" value={newBanHWID} onChange={(e) => setNewBanHWID(e.target.value)} />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="reason">Reason</Label>
                      <Input id="reason" placeholder="Reason" value={newBanReason} onChange={(e) => setNewBanReason(e.target.value)} />
                    </div>

                    <div className="flex flex-row space-x-2 justify-center items-center">
                      <div className={cn("flex flex-col space-y-1.5", expiration === "permanent" ? "w-full" : "")}>
                        <Label htmlFor="expiration">Expiration Date</Label>
                        <Select onValueChange={(value) => setExpiration(value as "permanent" | "temporary")} value={expiration}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Expiration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {expiration === "temporary" && <div className="flex flex-col space-y-1.5 w-full">
                        <Label htmlFor="expiration">Expiration Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left font-normal",
                                !expirationDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {expirationDate ? format(expirationDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={expirationDate}
                              onSelect={setExpirationDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>}
                    </div>
                    
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        const promise = fetch(`/api/script/${data.project_id}/manage/blacklist/add`, {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            hwid: newBanHWID,
                            reason: newBanReason,
                            expiration: expiration === "temporary" ? expirationDate?.getTime() : undefined,
                          }),
                        });

                        toast.promise(promise, {
                          loading: "Blacklisting...",
                          success: () => {
                            refreshScriptBanData();
                            setNewBanHWID("");
                            setNewBanReason("");
                            setExpiration("permanent");
                            setExpirationDate(undefined);
                            return "Blacklisted user successfully!";
                          },
                          error: "Failed to blacklist user",
                        });
                      }}>Blacklist</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Export Blacklist</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Export Blacklist</AlertDialogTitle>
                      <AlertDialogDescription>
                        Export blacklist for this project in different formats
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
                        const data_to_export = script_ban_data.map((key) => {
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
                          a.download = "bans.json";
                          a.click();
                          URL.revokeObjectURL(url);
                          a.remove();
                        }

                        if (exportFormat === "csv") {
                          const csvConfig = mkConfig({ useKeysAsHeaders: true });
                          download(csvConfig)(generateCsv(csvConfig)(data_to_export as []))
                        }
                      }}>Export All Bans</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </ScriptBlacklistDataTable>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </main>
  )
}