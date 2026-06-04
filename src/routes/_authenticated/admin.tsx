import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Expert Solutions" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => { const { data } = await supabase.rpc("get_admin_stats"); return data as any; },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin</h1>
        <p className="text-muted-foreground mt-1">Review submissions, withdrawals, and content.</p>
      </div>
      {stats?.success && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Total users" value={stats.totalUsers} />
          <Stat label="Clients" value={stats.totalClients} />
          <Stat label="Submitted" value={stats.tasksSubmitted} />
          <Stat label="Approved" value={stats.tasksApproved} />
          <Stat label="Pending withdrawals" value={stats.pendingWithdrawals} />
          <Stat label="Pending reviews" value={stats.pendingReviews} />
          <Stat label="Paid out" value={`$${Number(stats.totalPaid).toFixed(2)}`} />
        </div>
      )}
      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Task queue</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="joins">Plan joins</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><TaskQueue /></TabsContent>
        <TabsContent value="withdrawals"><WithdrawalsQueue /></TabsContent>
        <TabsContent value="reviews"><ReviewsQueue /></TabsContent>
        <TabsContent value="purchases"><PurchasesQueue /></TabsContent>
        <TabsContent value="joins"><PlanJoinsQueue /></TabsContent>
        <TabsContent value="users"><UsersList /></TabsContent>
      </Tabs>
    </div>
  );
}

function UsersList() {
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, created_at, wallets(available_balance, total_earned)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });
  if (!data?.length) return <p className="text-muted-foreground mt-4">No users yet.</p>;
  return (
    <div className="grid gap-2 mt-4">
      {data.map((u: any) => {
        const w = Array.isArray(u.wallets) ? u.wallets[0] : u.wallets;
        return (
          <Card key={u.id} className="glass">
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{u.full_name ?? u.username ?? u.id}</div>
                <div className="text-xs text-muted-foreground truncate">
                  Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">${Number(w?.available_balance ?? 0).toFixed(2)}</div>
                <div className="text-[10px] text-muted-foreground">earned ${Number(w?.total_earned ?? 0).toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return <Card className="glass"><CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-medium">{label}</CardTitle></CardHeader><CardContent><div className="text-xl font-bold">{value ?? 0}</div></CardContent></Card>;
}

function TaskQueue() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["review-queue"],
    queryFn: async () => { const { data } = await supabase.rpc("get_review_queue"); return (data as any[]) ?? []; },
  });
  async function review(id: string, approve: boolean, reason?: string) {
    const { data, error } = await supabase.rpc("review_task", { _task_id: id, _approve: approve, _reason: reason ?? undefined });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success(approve ? "Approved" : "Rejected"); qc.invalidateQueries(); }
  }
  if (!data?.length) return <p className="text-muted-foreground mt-4">No tasks awaiting review.</p>;
  return (
    <div className="grid gap-3 mt-4">
      {data.map((t) => (
        <Card key={t.id} className="glass">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">{t.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">by {t.user_full_name ?? t.user_username}</p>
              </div>
              <span className="text-sm font-medium">{Number(t.reward).toFixed(2)} {t.currency}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {t.submission_text && <p className="text-sm">{t.submission_text}</p>}
            {t.submission_url && <a href={t.submission_url} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View URL</a>}
            {Array.isArray(t.proof_files) && t.proof_files.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {t.proof_files.map((f: string) => <a key={f} href={f} target="_blank" rel="noreferrer"><img src={f} className="h-20 w-20 rounded border object-cover" /></a>)}
              </div>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => review(t.id, true)}>Approve</Button>
              <RejectDialog onConfirm={(reason) => review(t.id, false, reason)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RejectDialog({ onConfirm }: { onConfirm: (reason: string) => void }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="destructive">Reject</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rejection reason</DialogTitle></DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
        <Button onClick={() => { onConfirm(reason); setOpen(false); }} variant="destructive">Confirm reject</Button>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawalsQueue() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["withdraw-queue"],
    queryFn: async () => {
      const { data: ws } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (!ws?.length) return [];
      const ids = Array.from(new Set(ws.map((w) => w.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", ids);
      const map = new Map((profs ?? []).map((p) => [p.id, p]));
      return ws.map((w) => ({ ...w, profile: map.get(w.user_id) }));
    },
  });
  async function process(id: string, approve: boolean) {
    const { data, error } = await supabase.rpc("process_withdrawal", { _withdrawal_id: id, _approve: approve, _note: undefined });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success(approve ? "Marked paid" : "Rejected"); qc.invalidateQueries({ queryKey: ["withdraw-queue"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); }
  }
  if (!data?.length) return <p className="text-muted-foreground mt-4">No pending withdrawals.</p>;
  return (
    <div className="grid gap-3 mt-4">
      {data.map((w: any) => (
        <Card key={w.id} className="glass"><CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium">${Number(w.amount).toFixed(2)} via {w.method}</div>
            <div className="text-xs text-muted-foreground">{w.profile?.full_name ?? w.profile?.username ?? w.user_id}</div>
            <pre className="text-xs mt-1 text-muted-foreground">{JSON.stringify(w.details)}</pre>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => process(w.id, true)}>Mark paid</Button>
            <Button size="sm" variant="destructive" onClick={() => process(w.id, false)}>Reject</Button>
          </div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function ReviewsQueue() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["pending-reviews"],
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*").eq("status", "pending").order("created_at", { ascending: true });
      return data ?? [];
    },
  });
  async function act(id: string, approve: boolean) {
    const { data, error } = await supabase.rpc("approve_review", { _review_id: id, _approve: approve, _note: undefined });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success("Done"); qc.invalidateQueries(); }
  }
  if (!data?.length) return <p className="text-muted-foreground mt-4">No pending reviews.</p>;
  return (
    <div className="grid gap-3 mt-4">
      {data.map((r) => (
        <Card key={r.id} className="glass"><CardContent className="py-4 space-y-2">
          <div className="font-medium">{r.title ?? `Rating ${r.rating}`}</div>
          {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
          <div className="flex gap-2"><Button size="sm" onClick={() => act(r.id, true)}>Approve</Button><Button size="sm" variant="destructive" onClick={() => act(r.id, false)}>Reject</Button></div>
        </CardContent></Card>
      ))}
    </div>
  );
}

function PurchasesQueue() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: async () => {
      const { data: rows } = await supabase
        .from("package_purchases")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!rows?.length) return [];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const pkgIds = Array.from(new Set(rows.map((r) => r.package_id)));
      const [profs, pkgs] = await Promise.all([
        supabase.from("profiles").select("id, full_name, username").in("id", userIds),
        supabase.from("packages").select("id, name").in("id", pkgIds),
      ]);
      const pm = new Map((profs.data ?? []).map((p) => [p.id, p]));
      const km = new Map((pkgs.data ?? []).map((p) => [p.id, p]));
      return rows.map((r) => ({ ...r, profile: pm.get(r.user_id), pkg: km.get(r.package_id) }));
    },
  });
  async function review(id: string, approve: boolean, note?: string) {
    const { data, error } = await supabase.rpc("review_package_purchase", { _id: id, _approve: approve, _note: note ?? undefined });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success(approve ? "Approved" : "Rejected"); qc.invalidateQueries({ queryKey: ["admin-purchases"] }); }
  }
  if (!data?.length) return <p className="text-muted-foreground mt-4">No purchase requests.</p>;
  return (
    <div className="grid gap-3 mt-4">
      {data.map((p: any) => (
        <Card key={p.id} className="glass">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{p.pkg?.name ?? "Package"} — {Number(p.amount).toFixed(0)} {p.currency}</div>
                <div className="text-xs text-muted-foreground">
                  by {p.profile?.full_name ?? p.profile?.username ?? p.user_id} · {p.payment_method}
                </div>
                {(p.payer_name || p.payer_phone) && (
                  <div className="text-xs mt-1">{p.payer_name} {p.payer_phone && `· ${p.payer_phone}`}</div>
                )}
                {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
              </div>
              <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>{p.status}</Badge>
            </div>
            {p.screenshot_url && (
              <a href={p.screenshot_url} target="_blank" rel="noreferrer" className="block">
                <img src={p.screenshot_url} alt="Payment proof" className="max-h-48 rounded border object-contain bg-muted" />
              </a>
            )}
            {p.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => review(p.id, true)}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => review(p.id, false)}>Reject</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PlanJoinsQueue() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["plan-joins"],
    queryFn: async () => {
      const { data } = await supabase
        .from("plan_join_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });
  async function act(id: string, status: string) {
    const { data, error } = await supabase.rpc("update_plan_join_request", { _request_id: id, _status: status });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["plan-joins"] }); }
  }
  if (!data?.length) return <p className="text-muted-foreground mt-4">No join requests.</p>;
  return (
    <div className="grid gap-3 mt-4">
      {data.map((r: any) => (
        <Card key={r.id} className="glass">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{r.full_name}</div>
                <div className="text-xs text-muted-foreground">{r.email} {r.phone && `· ${r.phone}`}</div>
                {(r.plan_selected || r.country) && (
                  <div className="text-xs mt-1">
                    {r.plan_selected && <span>Plan: {r.plan_selected}</span>}
                    {r.country && <span> · {r.country}</span>}
                  </div>
                )}
                {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
              </div>
              <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"}>{r.status}</Badge>
            </div>
            {r.status === "pending" && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => act(r.id, "approved")}>Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => act(r.id, "rejected")}>Reject</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
