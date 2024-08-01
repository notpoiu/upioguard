import { delete_api_keys } from "@/app/dashboard/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Key } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

export const sample_key_data: Key[] = [
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-realkey",
    key_expires: null,
    key_type: "permanent",
    discord_id: "1177722124035706931",
    username: "upio",
    note: "sample data",
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
  {
    project_id: "1exzNuQ3Kr4pSGIR",
    key: "upioguard-temprealkey",
    key_expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    key_type: "temporary",
    discord_id: "1177722124035706931",
    username: "upio",
    note: null,
    hwid: "fingerprint-synapse-z-real",
    executor: "Synapse Z",
  },
]


export const columns: ColumnDef<Key>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "key",
    header: "Key",
  },
  {
    accessorKey: "key_type",
    header: "Key Type",
    cell: ({ row }) => {
      return (
        <>
          <Badge variant={(row.original.key_type === "temporary" || row.original.key_type === "checkpoint") ? "outline" : "default"} className="capitalize">{row.original.key_type}</Badge>
          {row.original.key_expires !== null && (row.original.key_expires as Date).getTime() < Date.now() && <Badge variant="destructive" className="capitalize mt-2">Expired</Badge>}
        </>
      )
    }
  },
  {
    accessorKey: "username",
    header: "Discord",
    cell: ({ row }) => {
      return (
        <span>{row.getValue("username")}</span>
      )
    }
  },
  {
    accessorKey: "hwid",
    header: "HWID",
    cell: ({ row }) => {
      if (row.original.hwid === null) {
        return <span className="text-muted-foreground font-light">None</span>
      }
      return <span>{row.original.hwid}</span>
    }
  },
  {
    accessorKey: "executor",
    header: "Executor",
    cell: ({ row }) => {
      if (row.original.executor === null) {
        return <span className="text-muted-foreground font-light">None</span>
      }
      return <span>{row.original.executor}</span>
    }
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => {
      if (row.original.note === null) {
        return <span className="text-muted-foreground font-light">None</span>
      }
      return <span>{row.original.note}</span>
    }
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                toast.success("API key copied to clipboard successfully!")
              }}
            >
              
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => {
              
            }}>Delete API key</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]