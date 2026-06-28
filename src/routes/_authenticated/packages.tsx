import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Check, Sparkles, Copy, Upload,
  Key, TrendingUp, Calendar, CalendarDays, Phone,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/packages")({
  head: () => ({ meta: [{ title: "Packages — Expert Solutions" }] }),
  component: PackagesPage,
});

const OPAY_NUMBER = "03371441111";
const MASHREQ_ACCOUNT = "089120147898";

function pkr(val: number) {
  return `₨${val.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

function PackagesPage() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: myPurchases } = useQuery({
    queryKey: ["my-purchases"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("package_purchases")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> Packages
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose your earning plan, pay via OPay or Mashreq Bank, then upload your screenshot.
        </p>
      </div>

      <PaymentInfo />
      <RedeemKeyCard />

      {isLoading ? (
        <p className="text-muted-foreground">Loading packages…</p>
      ) : !packages?.length ? (
        <PackageFallback />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p: any) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}

      {!!myPurchases?.length && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your Purchase Requests</h2>
          <div className="grid gap-2">
            {myPurchases.map((pp: any) => (
              <Card key={pp.id} className="glass">
                <CardContent className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {pkr(Number(pp.amount))} · {pp.payment_method}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(pp.created_at).toLocaleString()}
                    </div>
                    {pp.admin_note && (
                      <div className="text-xs mt-1 text-muted-foreground">Note: {pp.admin_note}</div>
                    )}
                  </div>
                  <StatusBadge status={pp.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

function PaymentInfo() {
  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  }
  return (
    <Card className="glass border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="h-4 w-4 text-primary" /> Payment Details
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Send payment to one of these accounts, then submit your package request with the screenshot as proof.
        </p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <PayRow label="OPay" value={OPAY_NUMBER} onCopy={() => copy(OPAY_NUMBER)} />
        <PayRow label="Mashreq Bank" value={MASHREQ_ACCOUNT} onCopy={() => copy(MASHREQ_ACCOUNT)} />
      </CardContent>
    </Card>
  );
}

function PayRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-card/60 border px-3 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">{label}</span>
        <span className="font-mono font-medium truncate text-sm">{value}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={onCopy} className="shrink-0 h-7 px-2">
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function RedeemKeyCard() {
  const qc = useQueryClient();
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  async function redeem() {
    if (!key.trim()) return toast.error("Please enter an activation key");
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc("redeem_activation_key", { _key: key.trim() });
      if (error || !(data as any)?.success) {
        toast.error((data as any)?.error ?? error?.message ?? "Invalid or already used key");
      } else {
        toast.success("Key redeemed! Your package is now active.");
        setKey("");
        qc.invalidateQueries();
      }
    } catch (e: any) {
      toast.error(e.message ?? "Failed to redeem");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="glass border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Key className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Have an Activation Key?
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Received a key from admin? Enter it here to instantly unlock your package.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter activation key (e.g. KEY-XXXX-XXXX)"
            className="font-mono"
            onKeyDown={(e) => e.key === "Enter" && redeem()}
          />
          <Button
            onClick={redeem}
            disabled={busy}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {busy ? "Redeeming…" : "Redeem"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Static fallback (when DB has no packages) ─────────────────── */

const FALLBACK_PACKAGES = [
  {
    name: "Starter",
    price: 799,
    tagline: "Video Watching",
    description: "Perfect for beginners. Watch short videos daily and earn real PKR from day one.",
    daily: 80, weekly: 560, monthly: 2400,
    features: [
      "Watch 5–10 videos per day",
      "Daily earning ₨80",
      "Weekly earning ₨560",
      "Monthly earning ₨2,400",
      "Withdraw via OPay or Mashreq Bank",
      "24/7 customer support",
    ],
    featured: false,
  },
  {
    name: "Professional",
    price: 1299,
    tagline: "Assignment Writing",
    description: "Work on essay writing and college assignments. Ideal for students and skilled writers.",
    daily: 250, weekly: 1750, monthly: 7500,
    features: [
      "Essay & assignment writing",
      "College / university tasks",
      "Daily earning ₨250",
      "Weekly earning ₨1,750",
      "Monthly earning ₨7,500",
      "Priority task assignment",
      "Withdraw via OPay or Mashreq Bank",
    ],
    featured: true,
  },
  {
    name: "Premium",
    price: 4500,
    tagline: "Video + Data Entry",
    description: "Top-tier plan combining video watching and data entry for maximum daily income.",
    daily: 400, weekly: 2800, monthly: 12000,
    features: [
      "Video watching tasks",
      "Data entry tasks",
      "Daily earning ₨400",
      "Weekly earning ₨2,800",
      "Monthly earning ₨12,000",
      "Highest task priority",
      "VIP support",
      "Bonus tasks available",
    ],
    featured: false,
  },
];

function PackageFallback() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FALLBACK_PACKAGES.map((p) => (
        <StaticPackageCard key={p.name} pkg={p} />
      ))}
    </div>
  );
}

function StaticPackageCard({ pkg }: { pkg: typeof FALLBACK_PACKAGES[0] }) {
  return (
    <Card
      className={
        "glass relative overflow-hidden flex flex-col " +
        (pkg.featured ? "border-primary/60 ring-1 ring-primary/30 shadow-elegant" : "")
      }
    >
      {pkg.featured && (
        <div className="absolute right-2 top-2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{pkg.name}</CardTitle>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">{pkg.tagline}</span>
        </div>
        <div className="mt-2 text-3xl font-extrabold">
          {pkr(pkg.price)}{" "}
          <span className="text-sm font-normal text-muted-foreground">one-time</span>
        </div>
        <p className="text-sm text-muted-foreground">{pkg.description}</p>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {/* Earnings table */}
        <div className="rounded-xl border bg-primary/5 p-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 text-center">Earnings Breakdown</div>
          <div className="grid grid-cols-3 gap-1 text-center">
            <EarnStat icon={TrendingUp} label="Daily" value={pkr(pkg.daily)} />
            <EarnStat icon={CalendarDays} label="Weekly" value={pkr(pkg.weekly)} />
            <EarnStat icon={Calendar} label="Monthly" value={pkr(pkg.monthly)} />
          </div>
        </div>

        <ul className="space-y-1.5 flex-1">
          {pkg.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t text-xs text-muted-foreground text-center">
          Pay via OPay or Mashreq Bank above, then contact admin to activate.
        </div>
      </CardContent>
    </Card>
  );
}

function EarnStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div>
      <Icon className="h-3.5 w-3.5 mx-auto text-primary mb-0.5" />
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xs font-bold">{value}</div>
    </div>
  );
}

/* ─── DB-driven package card ──────────────────────────────────────── */

function PackageCard({ pkg }: { pkg: any }) {
  const features: string[] = Array.isArray(pkg.features) ? pkg.features : [];
  const daily = Number(pkg.daily_earning ?? 0);
  const weekly = daily * 7;
  const monthly = daily * 30;

  return (
    <Card
      className={
        "glass relative overflow-hidden flex flex-col " +
        (pkg.is_featured ? "border-primary/60 ring-1 ring-primary/30 shadow-elegant" : "")
      }
    >
      {pkg.is_featured && (
        <div className="absolute right-2 top-2">
          <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl">{pkg.name}</CardTitle>
          {pkg.tagline && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">{pkg.tagline}</span>
          )}
        </div>
        <div className="mt-2 text-3xl font-extrabold">
          {pkr(Number(pkg.price))}{" "}
          <span className="text-sm font-normal text-muted-foreground">one-time</span>
        </div>
        {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        {daily > 0 && (
          <div className="rounded-xl border bg-primary/5 p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 text-center">Earnings Breakdown</div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <EarnStat icon={TrendingUp} label="Daily" value={pkr(daily)} />
              <EarnStat icon={CalendarDays} label="Weekly" value={pkr(weekly)} />
              <EarnStat icon={Calendar} label="Monthly" value={pkr(monthly)} />
            </div>
          </div>
        )}

        {features.length > 0 && (
          <ul className="space-y-1.5 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        <BuyDialog pkg={pkg} />
      </CardContent>
    </Card>
  );
}

/* ─── Buy dialog ────────────────────────────────────────────────── */

function BuyDialog({ pkg }: { pkg: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("opay");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const methodAccount = method === "opay" ? OPAY_NUMBER : MASHREQ_ACCOUNT;
  const methodLabel = method === "opay" ? "OPay" : "Mashreq Bank";

  async function submit() {
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { toast.error("Please sign in"); return; }

      let screenshot_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${u.user.id}/purchases/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("proof-uploads")
          .upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("proof-uploads").getPublicUrl(path);
        screenshot_url = pub.publicUrl;
      }

      const { error } = await supabase.from("package_purchases").insert({
        user_id: u.user.id,
        package_id: pkg.id,
        amount: pkg.price,
        currency: pkg.currency ?? "PKR",
        payment_method: method,
        payer_name: payerName || null,
        payer_phone: payerPhone || null,
        notes: notes || null,
        screenshot_url,
      });
      if (error) throw error;

      toast.success("Purchase submitted — we'll review and activate shortly!");
      setOpen(false);
      setFile(null);
      setPayerName(""); setPayerPhone(""); setNotes("");
      qc.invalidateQueries({ queryKey: ["my-purchases"] });
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-auto" size="lg">
          Buy Now — {pkr(Number(pkg.price))}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buy {pkg.name} Package</DialogTitle>
          <DialogDescription>
            Send {pkr(Number(pkg.price))} to one of the accounts below, then fill in your details and upload the screenshot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Method picker */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[
                { id: "opay", label: "OPay" },
                { id: "mashreq", label: "Mashreq Bank" },
              ].map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant={method === m.id ? "default" : "outline"}
                  onClick={() => setMethod(m.id)}
                  size="sm"
                >
                  {m.label}
                </Button>
              ))}
            </div>
            <div className="mt-2 rounded-lg bg-muted/60 border px-3 py-2 text-xs font-mono flex items-center justify-between">
              <span>
                <span className="font-semibold text-foreground">{methodLabel}:</span>{" "}
                {methodAccount}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1.5"
                onClick={() => { navigator.clipboard.writeText(methodAccount); toast.success("Copied"); }}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Your Full Name</Label>
            <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Sender name" />
          </div>
          <div>
            <Label>Your Phone Number</Label>
            <Input value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
          </div>
          <div>
            <Label>Payment Screenshot (required)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            {file && <p className="text-xs text-emerald-600 mt-1">✓ {file.name}</p>}
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any additional info…"
            />
          </div>

          <Button onClick={submit} disabled={busy} className="w-full" size="lg">
            {busy ? "Submitting…" : "Submit Purchase Request"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Our team verifies and activates within a few hours.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
