"use client";

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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export default function CreateKey({className, variant,children}: {className?: string, variant?: "secondary" | "outline" | "ghost" | "destructive" | "link" | "default" | null | undefined, children: React.ReactNode}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={cn(className)} variant={variant}>{children}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Key Creation Options</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new key for a user.
          </AlertDialogDescription>
        </AlertDialogHeader>

        

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button>Create</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}