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
import { Key } from "@/db/schema";
import { CalendarIcon, FilterIcon, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger } from "@radix-ui/react-popover"
import { PopoverContent } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  refresh: () => void;
  data: TData[]
  children?: React.ReactNode
}

export function KeyDataTable<TData, TValue>({
  refresh,
  data,
  children,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState<any>({});
  const [userEditOpen, setEditUserOpen] = React.useState(false);
  const [currentUserData, setUserData] = React.useState<Key | null>(null);
  const [keyExpiry, setKeyExpiry] = React.useState<Date>();
  
  const [newNote, setNewNote] = React.useState("");
  const [new_key_type, setNewKeyType] = React.useState<string>("temporary");

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [currentFilter, setCurrentFilter] = React.useState<string>("username");

  const columns: ColumnDef<Key>[] = [
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
            {row.original.key_expires !== null && row.original.key_type !== "permanent" && (row.original.key_expires as Date).getTime() < Date.now() && <Badge variant="destructive" className="capitalize mt-2">Expired</Badge>}
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
        return <p className="max-w-[5rem] text-ellipsis overflow-hidden">{row.original.hwid}</p>
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
                  navigator.clipboard.writeText(row.original.key)
                }}
              >
                Copy Key
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success("User ID copied to clipboard successfully!")
                  navigator.clipboard.writeText(row.original.discord_id)
                }}
              >
                Copy Discord ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  toast.promise(reset_hwid(row.original.project_id, row.original.key), {
                    loading: "Resetting HWID...",
                    success: () => {
                      refresh();
                      return "HWID reset successfully!";
                    },
                    error: "Failed to reset HWID",
                  })
                }}
              >
                Reset HWID
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setEditUserOpen(true);
                setUserData(row.original);
                setNewNote(row.original.note ?? "");
                setNewKeyType(row.original.key_type ?? "temporary");
              }}>
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => {
                const key = row.original;
                delete_script_key(row.original.project_id, key.key);
                refresh();
                toast("Key deleted successfully!", {
                  description: "If you did not mean to delete this key you may undo.",
                  action: {
                    label: "Undo",
                    onClick: () => {
                      create_script_key_raw(row.original.project_id, key).then(() => {
                        toast.success("Key deleted successfully, you may need to refresh to see the changes.");
                        refresh();
                      });
                    }
                  },
                  duration: 5000,
                })
              }}>Delete Key</DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => {
                if (row.original.hwid === null) {
                  toast.error("This key does not have an HWID, you cannot ban it.");
                  return;
                }

                toast.info("Banning HWIDs is not yet implemented.")
              }}>Ban HWID</DropdownMenuItem>
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
      <AlertDialog open={userEditOpen} onOpenChange={setEditUserOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Key</AlertDialogTitle>
            <AlertDialogDescription>
              Edit key properties
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm">Note</Label>
            <Input placeholder="Note" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-sm">Key Type</Label>
            <Select onValueChange={(value) => setNewKeyType(value as string)} value={new_key_type}>
              <SelectTrigger className="w-auto px-4">
                <SelectValue placeholder="Select key type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temporary">Temporary</SelectItem>
                <SelectItem value="checkpoint">Checkpoint</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {new_key_type === "temporary" && (
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="keyExpiry">Key Expires</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal",
                      !keyExpiry && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {keyExpiry ? format(keyExpiry, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={keyExpiry}
                    onSelect={setKeyExpiry}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              let new_key_data = currentUserData ?? {note: "", key_type: "temporary", key_expires: undefined};
              new_key_data.note = newNote;
              new_key_data.key_type = new_key_type as "temporary" | "checkpoint" | "permanent";

              const is_new_type = new_key_type !== currentUserData?.key_type;
              
              if (new_key_type === "temporary" && !keyExpiry) {
                toast.error("Key expires is required for temporary keys");
                return;
              }

              new_key_data.key_expires = new_key_type === "temporary" ? keyExpiry : new Date(0);

              const promise = fetch(`/api/script/${currentUserData?.project_id}/manage/key/edit`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  data: new_key_data,
                  discord_id: currentUserData?.discord_id,
                  reset_checkpoint_data: is_new_type,
                }),
              })

              toast.promise(promise, {
                loading: "Editing user...",
                success: () => {
                  refresh();
                  setEditUserOpen(false);
                  setNewNote("");
                  setNewKeyType("temporary");
                  setKeyExpiry(undefined);
                  return "User edited successfully!";
                },
                error: "Failed to edit user",
              })
            }}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <SelectItem value="username">Username</SelectItem>
            <SelectItem value="key">Key</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="hwid">HWID</SelectItem>
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
            <CreateKey refresh={refresh}>
              Create Key
            </CreateKey>
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
