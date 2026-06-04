import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/feature/file-upload";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Expert Solutions" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const { data: me } = useQuery({
    queryKey: ["profile-me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
      return { user: u.user, profile: data };
    },
  });
  const [form, setForm] = useState({
    full_name: "", username: "", phone: "", city: "", country: "", bio: "", avatar_url: "" as string | null,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me?.profile) setForm({
      full_name: me.profile.full_name ?? "",
      username: me.profile.username ?? "",
      phone: me.profile.phone ?? "",
      city: me.profile.city ?? "",
      country: me.profile.country ?? "",
      bio: me.profile.bio ?? "",
      avatar_url: me.profile.avatar_url ?? null,
    });
  }, [me?.profile?.id]);

  async function save() {
    if (!me?.user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name, username: form.username, phone: form.phone,
      city: form.city, country: form.country, bio: form.bio, avatar_url: form.avatar_url,
    }).eq("id", me.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Profile saved"); qc.invalidateQueries(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Update your details and avatar.</p>
      </div>
      <Card className="glass">
        <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
        <CardContent>
          <FileUpload
            bucket="avatars"
            pathPrefix={me?.user?.id ?? "anon"}
            accept="image/jpeg,image/png,image/webp"
            value={form.avatar_url}
            onChange={(url) => setForm((f) => ({ ...f, avatar_url: url }))}
          />
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
          <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <div className="sm:col-span-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
