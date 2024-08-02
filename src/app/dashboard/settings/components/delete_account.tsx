"use client";

import { AlertDialogHeader, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { delete_account } from "../../server";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function DeleteAccount() {
  const router = useRouter();

  return (<Card className="mt-5">
    <CardHeader>
      <CardTitle>Delete Account</CardTitle>
      <CardDescription>Delete your account and all associated data</CardDescription>
    </CardHeader>
    <CardContent>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={() => {
                toast.promise(delete_account(), {
                  loading: "Deleting account...",
                  success: () => {
                    setTimeout(() => {
                      router.push("/");
                    }, 1000);
                    return "Account deleted successfully!";
                  },
                  error: "Failed to delete account",
                })
              }}>Delete Account</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
    </CardContent>
  </Card>)
}