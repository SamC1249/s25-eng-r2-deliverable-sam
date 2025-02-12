"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";

interface Species {
  id: number;
  scientific_name: string;
  // Include additional fields if required
}

interface DeleteSpeciesDialogProps {
  species: Species;
  onClose: () => void;
}

export default function DeleteSpeciesDialog({
  species,
  onClose,
}: DeleteSpeciesDialogProps): JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async (): Promise<void> => {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", species.id);
    setLoading(false);

    if (error) {
      toast({
        title: "Error deleting species",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Species deleted",
        description: `Successfully deleted ${species.scientific_name}.`,
      });
      setOpen(false);
      router.refresh();
      onClose();
    }
  };

  const handleOpenChange = (openState: boolean): void => {
    setOpen(openState);
    if (!openState) {
      onClose();
    }
  };

  const handleCancelClick = (): void => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Delete Species</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{species.scientific_name}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting…" : "Delete"}
          </Button>
          <DialogClose asChild>
            <Button variant="secondary" onClick={handleCancelClick}>
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
