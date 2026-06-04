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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, Sparkles, Copy, Upload, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/_authenticated/packages")({
  head: () => ({ meta: [{ title: "Packages — Expert Solutions" }] }),
  component: PackagesPage,
});

const JAZZCASH_NUMBER = "03715607454";
const PAYMENT_EMAIL = "expertsolutions@outlook.com";

function PackagesPage() {
  const { data: packages, isLoading } = useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data } = await supabase.from("packages").select("*").eq("is_active", true).order("sort_order");
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
        <p className="text-muted-foreground mt-1">Pick a plan, pay, and upload your screenshot to activate.</p>
      </div>

      <PaymentInfo />

      {isLoading ? (
        <p className="text-muted-foreground">Loading packages…</p>
      ) : !packages?.length ? (
        <p className="text-muted-foreground">No packages available right now.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p: any) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}

      {!!myPurchases?.length && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your purchase requests</h2>
          <div className="grid gap-2">
            {myPurchases.map((pp: any) => (
              <Card key={pp.id} className="glass">
                <CardContent className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {Number(pp.amount).toFixed(0)} {pp.currency} · {pp.payment_method}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(pp.created_at).toLocaleString()}
                    </div>
                    {pp.admin_note && <div className="text-xs mt-1 text-muted-foreground">Note: {pp.admin_note}</div>}
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
  const variant = status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

function PaymentInfo() {
  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }
  return (
    <Card className="glass border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Payment details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2 rounded-md bg-card/50 p-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">JazzCash</span>
            <span className="font-mono font-medium truncate">{JAZZCASH_NUMBER}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => copy(JAZZCASH_NUMBER)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 rounded-md bg-card/50 p-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="font-mono font-medium truncate">{PAYMENT_EMAIL}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => copy(PAYMENT_EMAIL)}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PackageCard({ pkg }: { pkg: any }) {
  const features: string[] = Array.isArray(pkg.features) ? pkg.features : [];
  return (
    <Card className={"glass relative overflow-hidden " + (pkg.is_featured ? "border-primary/60 ring-1 ring-primary/30" : "")}>
      {pkg.is_featured && (
        <div className="absolute right-2 top-2">
          <Badge>Featured</Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{pkg.name}</CardTitle>
        {pkg.tagline && <p className="text-sm text-muted-foreground">{pkg.tagline}</p>}
        <div className="mt-2 text-3xl font-bold">
          {Number(pkg.price).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">{pkg.currency}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
        {features.length > 0 && (
          <ul className="space-y-1.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <BuyDialog pkg={pkg} />
      </CardContent>
    </Card>
  );
}

function BuyDialog({ pkg }: { pkg: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("jazzcash");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        toast.error("Please sign in");
        return;
      }
      let screenshot_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${u.user.id}/purchases/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("proof-uploads").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("proof-uploads").getPublicUrl(path);
        screenshot_url = pub.publicUrl;
      }
      const { error } = await supabase.from("package_purchases").insert({
        user_id: u.user.id,
        package_id: pkg.id,
        amount: pkg.price,
        currency: pkg.currency,
        payment_method: method,
        payer_name: payerName || null,
        payer_phone: payerPhone || null,
        payer_email: method === "email" ? PAYMENT_EMAIL : null,
        notes: notes || null,
        screenshot_url,
      });
      if (error) throw error;
      toast.success("Purchase submitted — we'll review shortly");
      setOpen(false);
      setFile(null);
      setPayerName("");
      setPayerPhone("");
      setNotes("");
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
        <Button className="w-full">Buy now</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buy {pkg.name}</DialogTitle>
          <DialogDescription>
            Send {Number(pkg.price).toFixed(0)} {pkg.currency} via JazzCash to{" "}
            <span className="font-mono">{JAZZCASH_NUMBER}</span> or email{" "}
            <span className="font-mono">{PAYMENT_EMAIL}</span>, then upload the screenshot below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant={method === "jazzcash" ? "default" : "outline"} onClick={() => setMethod("jazzcash")} size="sm">
              JazzCash
            </Button>
            <Button type="button" variant={method === "email" ? "default" : "outline"} onClick={() => setMethod("email")} size="sm">
              Email transfer
            </Button>
          </div>

          <div>
            <Label>Your name</Label>
            <Input value={payerName} onChange={(e) => setPayerName(e.target.value)} placeholder="Sender name" />
          </div>
          <div>
            <Label>Your phone (used for payment)</Label>
            <Input value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
          </div>
          <div>
            <Label>Payment screenshot</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
            {file && <p className="text-xs text-muted-foreground mt-1">{file.name}</p>}
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything we should know?" />
          </div>

          <Button onClick={submit} disabled={busy} className="w-full">
            {busy ? "Submitting…" : "Submit purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}