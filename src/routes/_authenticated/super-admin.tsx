import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Send, Key, Mail, Search, Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — Expert Solutions" }] }),
  component: SuperAdminPage,
});

function pkr(val: number) {
  return `₨${val.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function SuperAdminPage() {
  const { data: stats } = useQuery({
    queryKey: ["super-stats"],
    queryFn: async () => { const { data } = await supabase.rpc("get_superadmin_stats"); return data as any; },
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 grid place-items-center shadow-lg">
          <Crown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Super Admin</h1>
          <p className="text-muted-foreground text-sm">Platform controls, role management and task creation.</p>
        </div>
      </div>

      {stats && !stats.error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Users" value={stats.total_users} color="from-blue-500/20 to-blue-500/5" />
          <Stat label="Clients" value={stats.total_clients} color="from-emerald-500/20 to-emerald-500/5" />
          <Stat label="Admins" value={stats.total_admins} color="from-violet-500/20 to-violet-500/5" />
          <Stat label="Tasks" value={stats.total_tasks} color="from-amber-500/20 to-amber-500/5" />
          <Stat label="Submitted" value={stats.tasks_submitted} color="from-cyan-500/20 to-cyan-500/5" />
          <Stat label="Approved" value={stats.tasks_approved} color="from-green-500/20 to-green-500/5" />
          <Stat label="Earned" value={pkr(Number(stats.total_earned ?? 0))} color="from-emerald-500/20 to-emerald-500/5" />
          <Stat label="Withdrawn" value={pkr(Number(stats.total_withdrawn ?? 0))} color="from-rose-500/20 to-rose-500/5" />
        </div>
      )}

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="h-3.5 w-3.5 mr-1.5" /> Activation Keys
          </TabsTrigger>
          <TabsTrigger value="bulk">Bulk assign</TabsTrigger>
          <TabsTrigger value="users">Users & roles</TabsTrigger>
          <TabsTrigger value="fake">Fake reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="keys"><ActivationKeysPanel /></TabsContent>
        <TabsContent value="bulk"><BulkAssign /></TabsContent>
        <TabsContent value="users"><UserList /></TabsContent>
        <TabsContent value="fake"><FakeReviews /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <Card className={`glass bg-gradient-to-br ${color}`}>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs text-muted-foreground font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

/* ── Activation Keys Panel ──────────────────────────── */
function ActivationKeysPanel() {
  const qc = useQueryClient();
  const [newKey, setNewKey] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [selectedPkgId, setSelectedPkgId] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: keys } = useQuery({
    queryKey: ["activation-keys"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activation_keys")
        .select("*, packages(name)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const { data: packages } = useQuery({
    queryKey: ["packages-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("packages").select("id, name").eq("is_active", true).order("sort_order");
      return data ?? [];
    },
  });

  async function generateKey() {
    if (!selectedPkgId) return toast.error("Select a package first");
    const key = newKey.trim() || `KEY-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setCreating(true);
    const { error } = await supabase.from("activation_keys").insert({
      key,
      package_id: selectedPkgId,
      notes: newNotes || null,
      is_active: true,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Activation key created!", { description: key });
    setNewKey(""); setNewNotes("");
    qc.invalidateQueries({ queryKey: ["activation-keys"] });
  }

  return (
    <div className="space-y-5 mt-4">
      {/* Create key card */}
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Generate Activation Key
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Package</Label>
              <select
                value={selectedPkgId}
                onChange={(e) => setSelectedPkgId(e.target.value)}
                className="w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">— Select package —</option>
                {(packages ?? []).map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Custom Key (leave blank to auto-generate)</Label>
              <Input
                className="mt-1 font-mono text-sm"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="KEY-XXXX-XXXX"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Input className="mt-1 text-sm" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="e.g. for Ahmed Khan" />
          </div>
          <Button onClick={generateKey} disabled={creating} className="gap-2">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            Generate Key
          </Button>
        </CardContent>
      </Card>

      {/* Keys list */}
      <div className="space-y-2">
        {(keys ?? []).map((k: any) => (
          <KeyRow key={k.id} keyRow={k} packages={packages ?? []} onRefresh={() => qc.invalidateQueries({ queryKey: ["activation-keys"] })} />
        ))}
        {!keys?.length && <p className="text-muted-foreground text-sm py-4">No activation keys yet.</p>}
      </div>
    </div>
  );
}

function KeyRow({ keyRow, packages, onRefresh }: { keyRow: any; packages: any[]; onRefresh: () => void }) {
  const [sendOpen, setSendOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [ipBlocked, setIpBlocked] = useState(false);

  const pkgName = keyRow.packages?.name ?? packages.find((p: any) => p.id === keyRow.package_id)?.name ?? "Package";

  async function sendEmail() {
    if (!email.trim()) return toast.error("Enter recipient email");
    setSending(true);
    try {
      const res = await fetch("/api/send-activation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: email.trim(),
          toName: name.trim() || undefined,
          activationKey: keyRow.key,
          packageName: pkgName,
        }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "IP_NOT_AUTHORIZED") {
        toast.error("Brevo IP not authorized", {
          description: "Click the link below to authorize this server's IP in Brevo.",
          duration: 8000,
        });
        setIpBlocked(true);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to send");
      toast.success("Email sent! ✉️", { description: `Activation key delivered to ${email}` });
      setSent(true);
      setSendOpen(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message ?? "Email failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className={`glass ${keyRow.used_by ? "opacity-60" : ""}`}>
      <CardContent className="py-3 flex flex-wrap items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
          <Key className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm font-bold">{keyRow.key}</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{pkgName}</span>
            {keyRow.notes && <span>· {keyRow.notes}</span>}
            {keyRow.used_by && <span className="text-amber-600">· Used {keyRow.used_at ? new Date(keyRow.used_at).toLocaleDateString() : ""}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={keyRow.used_by ? "secondary" : "default"} className={keyRow.used_by ? "" : "bg-emerald-500/20 text-emerald-600 border-0"}>
            {keyRow.used_by ? "Used" : "Active"}
          </Badge>

          {!keyRow.used_by && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-8"
                onClick={() => { navigator.clipboard.writeText(keyRow.key); toast.success("Key copied!"); }}
              >
                Copy
              </Button>

              <Dialog open={sendOpen} onOpenChange={setSendOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5 h-8 bg-primary/90 hover:bg-primary">
                    <Send className="h-3.5 w-3.5" /> Email Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" /> Send Activation Key
                    </DialogTitle>
                  </DialogHeader>

                  {/* Key preview */}
                  <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Key to be sent</div>
                    <div className="font-mono text-lg font-black tracking-widest">{keyRow.key}</div>
                    <div className="text-xs text-muted-foreground mt-1">{pkgName}</div>
                  </div>

                  {/* IP blocked warning banner */}
                  {ipBlocked && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Brevo IP not authorized</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Brevo is blocking this server's IP address. You must authorize it once in your Brevo security settings.
                          </p>
                        </div>
                      </div>
                      <a
                        href="https://app.brevo.com/security/authorised_ips"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold py-2.5 transition-colors"
                      >
                        <span>🔓</span> Open Brevo → Authorize IP
                      </a>
                      <p className="text-[11px] text-center text-muted-foreground">
                        After authorizing, come back and click Send Email again.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Recipient Name</Label>
                      <Input
                        className="mt-1"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ahmed Khan"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Recipient Email *</Label>
                      <Input
                        className="mt-1"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ahmed@example.com"
                      />
                    </div>
                    <Button
                      onClick={sendEmail}
                      disabled={sending || !email.trim()}
                      className="w-full gap-2"
                    >
                      {sending
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                        : sent
                        ? <><Check className="h-4 w-4" /> Sent!</>
                        : <><Send className="h-4 w-4" /> Send Email</>
                      }
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      A beautifully designed email with step-by-step redemption instructions will be sent.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Bulk Assign ──────────────────────────────────── */
function BulkAssign() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("80");
  const [videoLinks, setVideoLinks] = useState("");
  const [taskType, setTaskType] = useState("general");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { data: users } = useQuery({
    queryKey: ["assign-users"],
    queryFn: async () => { const { data } = await supabase.rpc("get_users_for_assignment", { _limit: 500 }); return (data as any[]) ?? []; },
  });

  async function assign() {
    if (!title || selectedIds.size === 0) return toast.error("Title + users required");
    setSaving(true);
    const { data, error } = await supabase.rpc("bulk_assign_task", {
      _title: title, _description: description, _instructions: "",
      _task_type: taskType, _reward: parseFloat(reward) || 0, _currency: "PKR",
      _video_links: videoLinks.split("\n").map((s) => s.trim()).filter(Boolean),
      _thumbnail_url: undefined, _auto_approve: false,
      _user_ids: Array.from(selectedIds),
    });
    setSaving(false);
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else {
      toast.success(`Assigned to ${(data as any).assigned} users! 🎯`);
      setTitle(""); setDescription(""); setSelectedIds(new Set());
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <Card className="glass">
        <CardHeader><CardTitle>Task details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Reward (PKR)</Label><Input type="number" value={reward} onChange={(e) => setReward(e.target.value)} /></div>
            <div><Label>Type</Label><Input value={taskType} onChange={(e) => setTaskType(e.target.value)} placeholder="general / video" /></div>
          </div>
          <div><Label>Video links (one per line)</Label><Textarea value={videoLinks} onChange={(e) => setVideoLinks(e.target.value)} rows={3} /></div>
          <Button onClick={assign} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Assign to {selectedIds.size} users
          </Button>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Pick users</CardTitle>
            <span className="text-xs text-muted-foreground">{selectedIds.size} selected</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-y-auto space-y-1">
            {(users ?? []).map((u: any) => (
              <label key={u.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted cursor-pointer">
                <Checkbox checked={selectedIds.has(u.id)} onCheckedChange={(v) => {
                  setSelectedIds((s) => { const n = new Set(s); v ? n.add(u.id) : n.delete(u.id); return n; });
                }} />
                <Avatar className="h-6 w-6"><AvatarImage src={u.avatar_url} /><AvatarFallback>{(u.full_name ?? "U")[0]}</AvatarFallback></Avatar>
                <span className="text-sm truncate flex-1">{u.full_name ?? u.username ?? u.email}</span>
                <span className="text-xs text-muted-foreground">{u.completed_tasks ?? 0} done</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── User List ──────────────────────────────────── */
function UserList() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("");
  const { data } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => { const { data } = await supabase.rpc("get_admin_user_list"); return (data as any[]) ?? []; },
  });
  const filtered = useMemo(() => (data ?? []).filter((u) =>
    !filter || `${u.full_name} ${u.username} ${u.email}`.toLowerCase().includes(filter.toLowerCase())
  ), [data, filter]);

  async function toggleRole(uid: string, role: "admin" | "super_admin" | "client", enabled: boolean) {
    const { data, error } = await supabase.rpc("set_user_role", { _user_id: uid, _role: role, _enabled: enabled });
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
  }

  return (
    <div className="space-y-3 mt-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search users…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map((u: any) => {
          const roles: string[] = u.roles ?? [];
          return (
            <Card key={u.id} className="glass">
              <CardContent className="py-3 flex flex-wrap items-center gap-3">
                <Avatar><AvatarImage src={u.avatar_url} /><AvatarFallback>{(u.full_name ?? "U")[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{u.full_name ?? u.username}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {(["client", "admin", "super_admin"] as const).map((r) => (
                    <label key={r} className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <Checkbox checked={roles.includes(r)} onCheckedChange={(v) => toggleRole(u.id, r, !!v)} />
                      <span className="capitalize">{r.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── Fake Reviews ──────────────────────────────── */
function FakeReviews() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const { data } = useQuery({
    queryKey: ["fake-reviews-all"],
    queryFn: async () => { const { data } = await supabase.from("fake_reviews").select("*").order("sort_order"); return data ?? []; },
  });
  async function create() {
    const { data, error } = await supabase.rpc("upsert_fake_review", {
      _name: name, _avatar: "", _location: "Pakistan", _rating: rating, _content: content, _visible: true, _order: 0,
    });
    if (error || !(data as any)?.success) toast.error(error?.message ?? "Failed");
    else { toast.success("Review saved!"); setName(""); setContent(""); qc.invalidateQueries(); }
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <Card className="glass">
        <CardHeader><CardTitle>Add review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Rating (1–5)</Label><Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(parseInt(e.target.value) || 5)} /></div>
          <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} /></div>
          <Button onClick={create}>Save</Button>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader><CardTitle>Existing ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {(data ?? []).map((r: any) => (
              <div key={r.id} className="border rounded-xl p-2.5 text-sm">
                <div className="font-medium">{r.reviewer_name} · {"★".repeat(r.rating)}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
