import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentUserContext } from "@/lib/auth.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, ListTodo, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Expert Solutions" },
      { name: "description", content: "Your earnings, tasks, and activity overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [authReady, setAuthReady] = useState(false);
  const fetchCtx = useServerFn(getCurrentUserContext);
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: () => fetchCtx(),
    enabled: authReady,
    retry: false,
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && data.session?.access_token) setAuthReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: "Available", value: `$${Number(data?.wallet?.available_balance ?? 0).toFixed(2)}`, icon: Wallet },
    { label: "Pending", value: `$${Number(data?.wallet?.pending_balance ?? 0).toFixed(2)}`, icon: TrendingUp },
    { label: "Total earned", value: `$${Number(data?.wallet?.total_earned ?? 0).toFixed(2)}`, icon: ListTodo },
    { label: "Withdrawn", value: `$${Number(data?.wallet?.total_withdrawn ?? 0).toFixed(2)}`, icon: Video },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back{data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">Here's your account at a glance.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass shadow-elegant">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="glass">
        <CardHeader><CardTitle>What's next</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>The Video Task system, secure player, watch tracking, file uploads, and admin dashboards arrive in the next sessions per the approved plan.</p>
        </CardContent>
      </Card>
    </div>
  );
}
