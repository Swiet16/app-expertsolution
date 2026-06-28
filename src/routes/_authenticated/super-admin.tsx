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
import { toast } from "sonner";

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Super Admin</h1>
        <p className="text-muted-foreground mt-1">Platform controls, role management and task creation.</p>
      </div>
      {stats && !stats.error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Users" value={stats.total_users} />
          <Stat label="Clients" value={stats.total_clients} />
          <Stat label="Admins" value={stats.total_admins} />
          <Stat label="Tasks" value={stats.total_tasks} />
          <Stat label="Submitted" value={stats.tasks_submitted} />
          <Stat label="Approved" value={stats.tasks_approved} />
          <Stat label="Earned" value={pkr(Number(stats.total_earned ?? 0))} />
          <Stat label="Withdrawn" value={pkr(Number(stats.total_withdrawn ?? 0))} />
        </div>
      )}
      <Tabs defaultValue="bulk">
        <TabsList>
          <TabsTrigger value="bulk">Bulk assign</TabsTrigger>
          <TabsTrigger value="users">Users & roles</TabsTrigger>
          <TabsTrigger value="fake">Fake reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="bulk"><BulkAssign /></TabsContent>
        <TabsContent value="users"><UserList /></TabsContent>
        <TabsContent value="fake"><FakeReviews /></TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <Card className="glass">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs text-muted-foreground font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

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
    else { toast.success(`Assigned to ${(data as any).assigned} users`); setTitle(""); setDescription(""); setSelectedIds(new Set()); }
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
          <Button onClick={assign} disabled={saving}>Assign to {selectedIds.size} users</Button>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader><CardTitle>Pick users</CardTitle></CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-y-auto space-y-1">
            {(users ?? []).map((u: any) => (
              <label key={u.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
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
    else { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); }
  }

  return (
    <div className="space-y-3 mt-4">
      <Input placeholder="Search users…" value={filter} onChange={(e) => setFilter(e.target.value)} />
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
                <div className="flex items-center gap-2 flex-wrap">
                  {(["client", "admin", "super_admin"] as const).map((r) => (
                    <label key={r} className="flex items-center gap-1 text-xs">
                      <Checkbox checked={roles.includes(r)} onCheckedChange={(v) => toggleRole(u.id, r, !!v)} /> {r}
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
    else { toast.success("Saved"); setName(""); setContent(""); qc.invalidateQueries(); }
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4 mt-4">
      <Card className="glass">
        <CardHeader><CardTitle>Add fake review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Rating</Label><Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(parseInt(e.target.value) || 5)} /></div>
          <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} /></div>
          <Button onClick={create}>Save</Button>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader><CardTitle>Existing ({data?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {(data ?? []).map((r: any) => (
              <div key={r.id} className="border rounded p-2 text-sm">
                <div className="font-medium">{r.reviewer_name} · {r.rating}★</div>
                <div className="text-xs text-muted-foreground">{r.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
