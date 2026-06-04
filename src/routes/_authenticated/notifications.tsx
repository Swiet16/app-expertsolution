import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Expert Solutions" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase.from("notifications").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  async function markAll() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", u.user.id).is("read_at", null);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Activity, approvals and rewards.</p>
        </div>
        <Button variant="outline" onClick={markAll}>Mark all read</Button>
      </div>
      {!data?.length ? (
        <Card className="glass"><CardContent className="py-10 text-center text-muted-foreground">No notifications.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {data.map((n) => (
            <Card key={n.id} className={`glass ${!n.read_at ? "border-primary/40" : ""}`}>
              <CardContent className="py-3 flex items-start gap-3">
                <Bell className="h-4 w-4 mt-1 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {!n.read_at && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
