"use client"

import { ProjectApiKey } from "@/db/schema"
import { ColumnDef } from "@tanstack/react-table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { delete_api_keys } from "@/app/dashboard/server"

function ApiKeyComponent({api_key}: {api_key: string}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger onClick={() => {
        navigator.clipboard.writeText(api_key)
        setTimeout(() => setOpen(false), 750);
      }}>
        <p className={cn("max-w-[8rem] overflow-hidden text-ellipsis hover:blur-none transition-all", open ? "blur-none" : "blur-sm")}>{api_key}</p>
      </PopoverTrigger>
      <PopoverContent className="w-[9rem] p-2">
        <p className="text-xs text-center">
          Copied to clipboard successfully!
        </p>
      </PopoverContent>
    </Popover>

  )
}


export const columns: ColumnDef<ProjectApiKey>[] = [
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
    accessorKey: "api_key",
    header: "Key",
    cell: ({ row }) => {
      return <ApiKeyComponent api_key={row.getValue("api_key")} />
    }
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "project_id",
    header: "Script ID",
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
                navigator.clipboard.writeText(data.api_key)
                toast.success("API key copied to clipboard successfully!")
              }}
            >
              Copy API key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => {
              delete_api_keys([row.original])
            }}>Delete API key</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
