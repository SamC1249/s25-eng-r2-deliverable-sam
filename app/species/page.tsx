import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import SpeciesCard from "./species-card";
import AddSpeciesDialog from "./add-species-dialog";
import type { Database } from "@/lib/schema";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default async function SpeciesPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  // Fetch all species with their authors
  const { data: species, error } = await supabase
    .from("species")
    .select("*")
    .order("scientific_name", { ascending: true });

  if (error) {
    console.error("Error fetching species:", error);
    return <div>Error loading species</div>;
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Species Database</TypographyH2>
        <AddSpeciesDialog userId={session.user.id} />
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {species?.map((speciesItem) => (
          <SpeciesCard
            key={speciesItem.id}
            species={speciesItem}
            sessionUserId={session.user.id}
          />
        ))}
      </div>
    </>
  );
}
