"use client";

import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EditSpeciesDialog from "./edit-species-dialog";
import DeleteSpeciesDialog from "./delete-species";
import CommentsDialog from "./comments";


type Species = Database["public"]["Tables"]["species"]["Row"];

interface SpeciesCardProps {
  species: Species;
  sessionUserId: string;
}

export default function SpeciesCard({
  species,
  sessionUserId,
}: SpeciesCardProps): JSX.Element {
  const [isPopupOpen, setPopupOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const openPopup = (): void => setPopupOpen(true);
  const closePopup = (): void => setPopupOpen(false);

  const openEditDialog = (): void => setEditDialogOpen(true);
  const closeEditDialog = (): void => setEditDialogOpen(false);

  const openDeleteDialog = (): void => setDeleteDialogOpen(true);
  const closeDeleteDialog = (): void => setDeleteDialogOpen(false);

  const handleDialogOpenChange = (openState: boolean): void => {
    setPopupOpen(openState);
  };

  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image
            src={species.image}
            alt={species.scientific_name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <h4 className="text-lg font-light italic">{species.scientific_name}</h4>
      <p className="text-sm text-muted-foreground">{species.common_name}</p>
      <p>
        {species.description
          ? species.description.slice(0, 150).trim() + "..."
          : ""}
      </p>
      <Button className="mt-3 w-full" onClick={openPopup}>
        Learn More
      </Button>
      {isPopupOpen && (
        <Dialog
          open={isPopupOpen}
          onOpenChange={handleDialogOpenChange}
        >
          <DialogContent>
            <DialogTitle>{species.scientific_name}</DialogTitle>
            <p>Kingdom: {species.kingdom}</p>
            <p>Common Name: {species.common_name}</p>
            <p>Total Population: {species.total_population?.toLocaleString()}</p>
            <p>{species.description}</p>
            <Button onClick={closePopup}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
      {species.author === sessionUserId && (
        <div className="mt-3 flex flex-col gap-2">
          <Button onClick={openEditDialog} variant="outline">
            Edit Info
          </Button>
          {isEditDialogOpen && (
            <EditSpeciesDialog species={species} onClose={closeEditDialog} />
          )}
          <Button onClick={openDeleteDialog} variant="destructive">
            Delete Species
          </Button>
          {isDeleteDialogOpen && (
            <DeleteSpeciesDialog species={species} onClose={closeDeleteDialog} />
          )}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <CommentsDialog speciesId={species.id} sessionUserId={sessionUserId} />
      </div>
    </div>
  );
}
