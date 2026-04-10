export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated users go to dashboard
  if (user) redirect("/dashboard");

  // Unauthenticated users go to login (no public landing page yet)
  redirect("/login");
}
