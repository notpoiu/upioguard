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
import KeyCreationStepper from "./key-creation-stepper";
import { useState } from "react";
import { is } from "drizzle-orm";


export default function CreateKey({className, refresh, variant,children}: {className?: string, refresh: () => void, variant?: "secondary" | "outline" | "ghost" | "destructive" | "link" | "default" | null | undefined, children: React.ReactNode}) {
  const [is_open, setIsOpen] = useState(false);
  return (
    <AlertDialog open={is_open} onOpenChange={setIsOpen}>
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

        <KeyCreationStepper set_open={setIsOpen} refresh={refresh} />
      </AlertDialogContent>
    </AlertDialog>
  )
}