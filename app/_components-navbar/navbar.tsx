import { createServerSupabaseClient } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
        Home
      </Link>
      {user && (
        <Link href="/species" className="text-sm font-medium transition-colors hover:text-primary">
          Species
        </Link>
      )}
      {user && (
        <Link href="/profiles" className="text-sm font-medium transition-colors hover:text-primary">
          Profiles
        </Link>
      )}
    </nav>
  );
}

