import { redirect } from "next/navigation";

import { AuthProvider } from "@/contexts/auth-context";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component on purpose: auth gating and profile loading stay on the server
  // so protected data never depends on a client-side redirect flash.
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id,business_name,logo_url,brand_color,created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AuthProvider user={user} profile={profile}>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
