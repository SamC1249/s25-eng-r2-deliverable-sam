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

export default function SpeciesCard({ species, sessionUserId }: SpeciesCardProps) {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const openPopup = () => setPopupOpen(true);
  const closePopup = () => setPopupOpen(false);

  const openEditDialog = () => setEditDialogOpen(true);
  const closeEditDialog = () => setEditDialogOpen(false);

  const openDeleteDialog = () => setDeleteDialogOpen(true);
  const closeDeleteDialog = () => setDeleteDialogOpen(false);

  return (
    // Added "relative" and extra bottom padding ("pb-12") for proper absolute positioning.
    <div className="relative m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow pb-12">
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
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      <Button className="mt-3 w-full" onClick={openPopup}>
        Learn More
      </Button>
      {isPopupOpen && (
        <Dialog open={isPopupOpen} onOpenChange={setPopupOpen}>
          <DialogContent>
            <DialogTitle>{species.scientific_name}</DialogTitle>
            <p>Kingdom: {species.kingdom}</p>
            <p>Common Name: {species.common_name}</p>
            <p>Total Population: {species.total_population}</p>
            <p>{species.description}</p>
            <Button onClick={closePopup}>Close</Button>
          </DialogContent>
        </Dialog>
      )}
      {/* Position the CommentsDialog at the bottom-right of the card */}
      <div className="position">
        <CommentsDialog speciesId={species.id} sessionUserId={sessionUserId} />
      </div>
      {species.author === sessionUserId && (
        <>
          <Button onClick={openEditDialog} className="mt-3 w-full">
            Edit Info
          </Button>
          {isEditDialogOpen && (
            <EditSpeciesDialog species={species} onClose={closeEditDialog} />
          )}
          <Button onClick={openDeleteDialog} className="mt-3 w-full">
            Delete Species
          </Button>
          {isDeleteDialogOpen && (
            <DeleteSpeciesDialog species={species} onClose={closeDeleteDialog} />
          )}
        </>
      )}
    </div>
  );
}
