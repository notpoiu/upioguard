"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  RowSelectionState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import React from "react"

interface DataTableProps<TData, TValue> {
  refresh: any
  data: TData[],
  rowSelection: any,
  setRowSelection: any
}


import { ProjectApiKey } from "@/db/schema"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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


export function DataTable<TData, TValue>({
  refresh,
  data,
  rowSelection,
  setRowSelection,
}: DataTableProps<TData, TValue>) {
  const columns: ColumnDef<ProjectApiKey>[] = [
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
                refresh();
              }}>Delete API key</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]  

  const table = useReactTable({
    // @ts-ignore
    data,
    //@ts-ignore
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    }
  })


  return {
    table: () => {
      return (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )
    },
    tableData: table

  }
}
