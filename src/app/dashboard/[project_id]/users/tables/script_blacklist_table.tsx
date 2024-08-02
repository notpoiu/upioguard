"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import React from "react"
import CreateKey from "../components/create-key"

import { create_script_key_raw, delete_script_key, modify_key_note, reset_hwid } from "@/app/dashboard/server";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BannedUser, Key } from "@/db/schema";
import { FilterIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
  refresh: () => void;
  data: TData[]
  children?: React.ReactNode
}

export function ScriptBlacklistDataTable<TData, TValue>({
  refresh,
  data,
  children,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<any>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [currentFilter, setCurrentFilter] = React.useState<string>("hwid");

  const columns: ColumnDef<BannedUser>[] = [
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
      accessorKey: "hwid",
      header: "HWID",
      cell: ({ row }) => {
        return <p className="max-w-[5rem] text-ellipsis overflow-hidden">{row.original.hwid}</p>
      }
    },
    {
      accessorKey: "reason",
      header: "Blacklist Reason",
      cell: ({ row }) => {
        if (row.original.reason === null || row.original.reason === "" || row.original.reason === undefined) {
          return <span className="text-muted-foreground font-light">None</span>
        }
        return <span>{row.original.reason}</span>
      }
    },
    {
      accessorKey: "expires",
      header: "Expires",
      cell: ({ row }) => {
        if (row.original.expires === null || row.original.expires === undefined) {
          return <span className="text-muted-foreground font-light">Permanent</span>
        }
        return <span>in {Math.ceil((row.original.expires.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</span>
      }
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
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
                  toast.success("HWID copied to clipboard successfully!")
                  navigator.clipboard.writeText(row.original.hwid ?? "No HWID")
                }}
              >
                Copy HWID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success("Key copied to clipboard successfully!")
                  navigator.clipboard.writeText(row.original.reason ?? "No Reason")
                }}
              >
                Copy Reason
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => {
                const promise = fetch(`/api/script/${row.original.project_id}/manage/blacklist/remove`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    hwid: row.original.hwid,
                  }),
                });

                toast.promise(promise, {
                  loading: "Unblacklisting user...",
                  success: () => {
                    refresh();
                    return "User unblacklisted successfully!";
                  },
                  error: "Failed to unblacklist user",
                });
              }}>Unblacklist User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    //@ts-ignore
    data,
    //@ts-ignore
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      rowSelection,
      columnFilters,
    }
  })

  useEffect(() => {
    table.setPageSize(4);
  },[])

  return (
    <div>
      <div className="flex items-center mb-2">
        <Input
          placeholder={`Search by ${currentFilter}`}
          value={(table.getColumn(currentFilter)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(currentFilter)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select onValueChange={(value) => setCurrentFilter(value as string)} value={currentFilter}>
          <SelectTrigger className="w-auto px-4 ml-2">
            <FilterIcon className="h-4 w-4 mr-3" /> <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hwid">HWID</SelectItem>
            <SelectItem value="reason">Reason</SelectItem>
            <SelectItem value="expires">Expiry</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
      <div className="flex flex-row">
        <div className="flex items-center justify-center space-x-2 py-4">
            {children}
        </div>
        <div className="flex items-center justify-center space-x-2 py-4 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
