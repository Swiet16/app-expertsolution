import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // If profile is not complete and user is not already on /profile, redirect there
    if (!location.pathname.startsWith("/profile")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, city")
        .eq("id", data.user.id)
        .maybeSingle();

      const isIncomplete = !profile?.full_name || !profile?.phone || !profile?.city;
      // Only redirect on very first visit (no profile data at all)
      const isNewUser = !profile?.full_name && !profile?.phone && !profile?.city;
      if (isNewUser) {
        throw redirect({ to: "/profile" });
      }
    }

    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
