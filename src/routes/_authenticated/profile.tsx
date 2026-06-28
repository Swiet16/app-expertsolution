import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Loader2, Lock, ShieldCheck, Camera, MapPin, Mail,
  Phone, User as UserIcon, Globe, CalendarClock,
  AlertTriangle, ArrowRight, ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Expert Solutions" }] }),
  component: ProfilePage,
});

const LOCK_DAYS = 60;

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

  const lockInfo = useMemo(() => {
    const lockedAt: string | null = (me?.profile as any)?.details_locked_at ?? null;
    if (!lockedAt) return { locked: false, daysLeft: 0, unlockDate: null as Date | null };
    const lockTs = new Date(lockedAt).getTime();
    const unlockTs = lockTs + LOCK_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();
    if (now >= unlockTs) return { locked: false, daysLeft: 0, unlockDate: new Date(unlockTs) };
    return { locked: true, daysLeft: Math.ceil((unlockTs - now) / 86400000), unlockDate: new Date(unlockTs) };
  }, [me?.profile]);

  const allFilled = !!(form.full_name && form.username && form.phone && form.city && form.country);
  const isNewUser = !me?.profile?.full_name && !me?.profile?.phone;
  const activeStrikes = (strikes ?? []).filter((s: any) => s.is_active !== false);

  async function saveAvatar(url: string | null) {
    setForm((f) => ({ ...f, avatar_url: url }));
    if (!me?.user) return;
    const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", me.user.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Avatar updated");
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  }

  async function save() {
    if (!me?.user) return;
    if (lockInfo.locked) return toast.error("Details are locked");
    if (!form.full_name || !form.phone) return toast.error("Full name and phone are required");
    setSaving(true);
    const payload: any = {
      full_name: form.full_name, username: form.username, phone: form.phone,
      city: form.city, country: form.country, bio: form.bio,
    };
    if (allFilled && !(me.profile as any)?.details_locked_at) {
      payload.details_locked_at = new Date().toISOString();
    }
    const { error } = await supabase.from("profiles").update(payload).eq("id", me.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success(payload.details_locked_at ? `Profile saved & details locked for ${LOCK_DAYS} days` : "Profile saved!");
      qc.invalidateQueries({ queryKey: ["profile-me"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  }

  const initial = (form.full_name || form.username || "U")[0]?.toUpperCase();

  return (
    <div className="space-y-6 pb-10">
      {/* New user onboarding banner */}
      {isNewUser && (
        <div className="rounded-2xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm">Welcome! Please complete your profile first</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Fill in your details below to activate your account and start earning PKR.
            </div>
          </div>
          <Link to="/dashboard">
            <Button size="sm" variant="ghost" className="shrink-0 gap-1 text-xs">
              Skip <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      )}

      {/* Strikes warning */}
      {activeStrikes.length > 0 && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
            <ShieldAlert className="h-4 w-4" />
            {activeStrikes.length} Active Strike{activeStrikes.length > 1 ? "s" : ""} — Warning
          </div>
          {activeStrikes.map((s: any, i: number) => (
            <div key={s.id ?? i} className="text-xs text-muted-foreground bg-destructive/5 rounded-lg px-3 py-2">
              <span className="font-medium text-foreground">Strike {i + 1}:</span> {s.reason ?? "Violation of platform rules"}{" "}
              <span className="opacity-60">· {s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">3 strikes result in a permanent account ban. Please follow the platform rules.</p>
        </div>
      )}

      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elegant">
        <div className="absolute -top-16 -right-12 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="relative p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-white/30 shadow-glow">
              <AvatarImage src={form.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl bg-white/20 text-primary-foreground">{initial}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1">
              <AvatarUpload userId={me?.user?.id ?? "anon"} onChange={saveAvatar} />
            </div>
          </div>
          <div className="text-center sm:text-left min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
              {form.full_name || "Your Name"}
            </h1>
            <p className="opacity-80 truncate">@{form.username || "username"}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              {form.city && <Chip icon={MapPin}>{form.city}</Chip>}
              {form.country && <Chip icon={Globe}>{form.country}</Chip>}
              {lockInfo.locked ? (
                <Chip icon={Lock}>Locked · {lockInfo.daysLeft}d left</Chip>
              ) : (me?.profile as any)?.details_locked_at ? (
                <Chip icon={ShieldCheck}>Verified</Chip>
              ) : (
                <Chip icon={CalendarClock}>Profile incomplete</Chip>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lock notice */}
      {lockInfo.locked && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3 text-sm">
          <Lock className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
          <div>
            <div className="font-semibold">Your details are locked</div>
            <div className="text-muted-foreground">
              You can edit your profile photo anytime, but other details unlock on{" "}
              {lockInfo.unlockDate?.toLocaleDateString()} ({lockInfo.daysLeft} days left).
            </div>
          </div>
        </div>
      )}

      {/* Details card */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="h-4 w-4 text-primary" /> Personal Details
          </CardTitle>
          {!lockInfo.locked && (
            <p className="text-xs text-muted-foreground">
              Fields marked <span className="text-destructive">*</span> are required. Completing all fields locks your details for security.
            </p>
          )}
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Field icon={UserIcon} label="Full name *" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} disabled={lockInfo.locked} placeholder="Muhammad Ali" />
          <Field icon={UserIcon} label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} disabled={lockInfo.locked} placeholder="m_ali" />
          <Field icon={Phone} label="Phone number *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} disabled={lockInfo.locked} placeholder="03XX-XXXXXXX" />
          <Field icon={Mail} label="Email" value={me?.user?.email ?? ""} onChange={() => {}} disabled placeholder="" />
          <Field icon={MapPin} label="City *" value={form.city} onChange={(v) => setForm({ ...form, city: v })} disabled={lockInfo.locked} placeholder="Karachi" />
          <Field icon={Globe} label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} disabled={lockInfo.locked} placeholder="Pakistan" />
          <div className="sm:col-span-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              disabled={lockInfo.locked}
              placeholder="Tell us about yourself…"
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <Button
              onClick={save}
              disabled={saving || lockInfo.locked}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow shadow-glow w-full sm:w-auto"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {lockInfo.locked ? "Locked" : "Save Profile"}
            </Button>
            {!lockInfo.locked && !(me?.profile as any)?.details_locked_at && (
              <p className="text-xs text-muted-foreground">
                Saving with all required fields will lock your details for {LOCK_DAYS} days for security.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account info */}
      <Card className="glass">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> Account Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Email verified</span>
            <Badge variant="default" className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0">Verified</Badge>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-muted-foreground">Profile status</span>
            <Badge variant={allFilled ? "default" : "secondary"}>
              {allFilled ? "Complete" : "Incomplete"}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Active strikes</span>
            <Badge variant={activeStrikes.length > 0 ? "destructive" : "default"} className={activeStrikes.length === 0 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-0" : ""}>
              {activeStrikes.length} / 3
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Chip({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-xs font-medium">
      <Icon className="h-3 w-3" /> {children}
    </span>
  );
}

function Field({
  icon: Icon, label, value, onChange, disabled, placeholder,
}: { icon: any; label: string; value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3 w-3" /> {label}
      </Label>
      <div className="mt-1 relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={disabled ? "pr-8" : ""}
        />
        {disabled && <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />}
      </div>
    </div>
  );
}

function AvatarUpload({ userId, onChange }: { userId: string; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="block cursor-pointer rounded-full bg-primary text-primary-foreground p-2 shadow-glow hover:scale-105 transition ring-2 ring-white/50">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
      <span className="sr-only">Change photo</span>
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handle} disabled={uploading} />
    </label>
  );
}
