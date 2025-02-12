"use client";

import { Button } from "@/components/ui/button";
import type { Database } from "@/lib/schema";
import Image from "next/image";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: Profile;
  sessionUserId: string;
}

export default function ProfileCard({ profile, sessionUserId }: ProfileCardProps) {
  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      <div className="flex items-center gap-4">
        {profile.avatar_url && (
          <div className="relative h-16 w-16 rounded-full">
            <Image
              src={profile.avatar_url}
              alt={`${profile.username}'s avatar`}
              fill
              className="rounded-full"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">{profile.display_name || "Anonymous"}</h3>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      {profile.biography && (
        <p className="mt-4 text-sm text-muted-foreground">
          {profile.biography.slice(0, 100).trim() + (profile.biography.length > 100 ? "..." : "")}
        </p>
      )}

      {profile.id === sessionUserId && (
        <div className="mt-4 flex gap-2">
          <Button variant="outline" className="flex-1">
            Edit Profile
          </Button>
          <Button variant="destructive" className="flex-1">
            Delete Account
          </Button>
        </div>
      )}
    </div>
  );
}
