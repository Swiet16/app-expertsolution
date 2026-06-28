import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserContext } from "@/lib/auth.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet, TrendingUp, ListTodo, Video, Package,
  ArrowRight, Star, AlertTriangle, ShieldAlert, Gavel,
} from "lucide-react";
import { FineAlertSection } from "@/components/fine-alert-section";
import { PayoutFloatingNotification } from "@/components/payout-ticker";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function pkr(val: number) {
  return `₨${val.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUserContext,
    retry: false,
  });

  const { data: strikes } = useQuery({
    queryKey: ["my-strikes"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("strikes")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const activeStrikes = (strikes ?? []).filter((s: any) => s.is_active !== false);

  const stats = [
    { label: "Available", value: pkr(Number(data?.wallet?.available_balance ?? 0)), icon: Wallet, tone: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Pending", value: pkr(Number(data?.wallet?.pending_balance ?? 0)), icon: TrendingUp, tone: "from-amber-500/20 to-amber-500/5" },
    { label: "Total Earned", value: pkr(Number(data?.wallet?.total_earned ?? 0)), icon: ListTodo, tone: "from-blue-500/20 to-blue-500/5" },
    { label: "Withdrawn", value: pkr(Number(data?.wallet?.total_withdrawn ?? 0)), icon: Video, tone: "from-purple-500/20 to-purple-500/5" },
  ];

  const isProfileIncomplete = !data?.profile?.full_name || !data?.profile?.phone || !data?.profile?.city;

  return (
    <div className="space-y-6">
      <PayoutFloatingNotification />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back{data?.profile?.full_name ? `, ${data.profile.full_name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your account at a glance.</p>
      </div>

      {/* Profile incomplete */}
      {isProfileIncomplete && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Complete your profile</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Add your name, phone, and city to fully activate your account.
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="shrink-0 border-amber-500/40">
            <Link to="/profile">Fill profile</Link>
          </Button>
        </div>
      )}

      {/* Strikes warning */}
      {activeStrikes.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-destructive">
              {activeStrikes.length} active strike{activeStrikes.length > 1 ? "s" : ""}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {activeStrikes[0]?.reason ?? "Violation of platform rules."} 3 strikes = account ban.
            </div>
          </div>
        </div>
      )}

      {/* Fine alerts */}
      <FineAlertSection />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={`glass shadow-elegant relative overflow-hidden bg-gradient-to-br ${s.tone}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass hover:shadow-elegant transition-all cursor-pointer group">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Video className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Video Tasks</div>
              <div className="text-xs text-muted-foreground">Watch & earn PKR</div>
            </div>
            <Link to="/video-tasks"><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
          </CardContent>
        </Card>
        <Card className="glass hover:shadow-elegant transition-all cursor-pointer group">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 grid place-items-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <ListTodo className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Tasks</div>
              <div className="text-xs text-muted-foreground">Claim & submit</div>
            </div>
            <Link to="/tasks"><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
          </CardContent>
        </Card>
        <Card className="glass hover:shadow-elegant transition-all cursor-pointer group">
          <CardContent className="py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 grid place-items-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Package className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">Packages</div>
              <div className="text-xs text-muted-foreground">Upgrade your plan</div>
            </div>
            <Link to="/packages"><ArrowRight className="h-4 w-4 text-muted-foreground" /></Link>
          </CardContent>
        </Card>
      </div>

      {/* Earning guide */}
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" /> How to Earn More
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">1.</span>
            <span>Complete your profile to unlock all tasks and features.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">2.</span>
            <span>Choose a package — Starter (₨799), Professional (₨1,299) or Premium (₨4,500).</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">3.</span>
            <span>Complete daily tasks to earn your daily reward.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold mt-0.5">4.</span>
            <span>Withdraw earnings via OPay or Mashreq Bank transfer.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
