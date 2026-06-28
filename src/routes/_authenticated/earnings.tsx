import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Banknote } from "lucide-react";

export const Route = createFileRoute("/_authenticated/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Expert Solutions" }] }),
  component: EarningsPage,
});

function pkr(val: number) {
  return `₨${val.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("earnings")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const total = (data ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const pending = (data ?? []).filter((e) => e.status === "pending").reduce((s, e) => s + Number(e.amount), 0);
  const approved = (data ?? []).filter((e) => e.status === "approved" || e.status === "paid").reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> Earnings
        </h1>
        <p className="text-muted-foreground mt-1">Your complete earning history in PKR.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="glass shadow-elegant bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{pkr(total)}</div>
            <div className="text-xs text-muted-foreground mt-1">{(data ?? []).length} transactions</div>
          </CardContent>
        </Card>
        <Card className="glass bg-gradient-to-br from-blue-500/20 to-blue-500/5">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pkr(approved)}</div>
          </CardContent>
        </Card>
        <Card className="glass bg-gradient-to-br from-amber-500/20 to-amber-500/5">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pkr(pending)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Banknote className="h-4 w-4 text-primary" /> History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm py-6 text-center">Loading…</p>
          ) : !data?.length ? (
            <div className="py-10 text-center text-muted-foreground">
              <Banknote className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No earnings yet. Complete tasks to start earning!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border bg-card/60 px-3 py-2.5 text-sm hover:bg-card transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold">+{pkr(Number(e.amount))}</div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {e.source} · {new Date(e.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      e.status === "approved" || e.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : e.status === "rejected"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
