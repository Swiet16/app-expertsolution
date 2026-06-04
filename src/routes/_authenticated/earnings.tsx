import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Expert Solutions" }] }),
  component: EarningsPage,
});

function EarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase.from("earnings").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const total = (data ?? []).reduce((s, e) => s + Number(e.amount), 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Earnings</h1>
        <p className="text-muted-foreground mt-1">Your full earning history.</p>
      </div>
      <Card className="glass shadow-elegant">
        <CardHeader><CardTitle>Lifetime earnings</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold">${total.toFixed(2)}</div></CardContent>
      </Card>
      <Card className="glass">
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> :
            !data?.length ? <p className="text-muted-foreground text-sm">No earnings yet.</p> :
            <div className="space-y-2">
              {data.map((e) => (
                <div key={e.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">+${Number(e.amount).toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{e.source} · {new Date(e.created_at).toLocaleString()}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{e.status}</span>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}
