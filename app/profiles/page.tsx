import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import ProfileCard from "./profile-card";

interface ProfileCardProps {
  profile: Profile;
  sessionUserId: string;
}

export default async function ProfilesPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("display_name", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return <div>Error loading profiles</div>;
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <TypographyH2>Profiles</TypographyH2>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {profiles?.map((profile) => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </>
  );
}
