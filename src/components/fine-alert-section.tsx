import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Gavel, Upload, AlertTriangle, Clock } from "lucide-react";

function pkr(val: number) {
  return `₨${val.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function FineAlertSection() {
  const { data: fines } = useQuery({
    queryKey: ["my-fines"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase
        .from("fines")
        .select("*")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const unpaid = (fines ?? []).filter(
    (f) => f.status !== "paid" && f.status !== "cancelled"
  );

  if (!unpaid.length) return null;

  return (
    <div className="space-y-2">
      {unpaid.map((fine: any) => (
        <FineAlert key={fine.id} fine={fine} />
      ))}
    </div>
  );
}

function FineAlert({ fine }: { fine: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const isSubmitted = fine.status === "submitted";

  const statusLabel = isSubmitted ? "Proof submitted — awaiting review" : "Payment required";
  const statusVariant = isSubmitted ? "secondary" : "destructive";

  async function submitProof() {
    if (!file) return toast.error("Please select your payment screenshot");
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${u.user.id}/fines/${fine.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("proof-uploads")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("proof-uploads").getPublicUrl(path);

      const { data, error } = await supabase.rpc("submit_fine_proof", {
        _fine_id: fine.id,
        _screenshot_url: pub.publicUrl,
      });

      if (error || !(data as any)?.success) {
        throw new Error((data as any)?.error ?? error?.message ?? "Failed to submit");
      }

      toast.success("Proof submitted! Admin will review shortly.");
      setOpen(false);
      setFile(null);
      qc.invalidateQueries({ queryKey: ["my-fines"] });
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="h-9 w-9 rounded-xl bg-destructive/15 grid place-items-center text-destructive shrink-0 mt-0.5">
          <Gavel className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-destructive text-sm">
              Fine: {pkr(Number(fine.amount))}
            </span>
            <Badge variant={statusVariant as any} className="text-[10px] px-1.5 py-0.5">
              {isSubmitted ? <Clock className="h-2.5 w-2.5 mr-1 inline" /> : <AlertTriangle className="h-2.5 w-2.5 mr-1 inline" />}
              {statusLabel}
            </Badge>
          </div>
          {fine.reason && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{fine.reason}</p>
          )}
          <div className="text-[11px] text-muted-foreground mt-1">
            Issued {new Date(fine.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {!isSubmitted && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="destructive" className="shrink-0 gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Pay & Submit Proof
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Gavel className="h-4 w-4" /> Pay Fine — {pkr(Number(fine.amount))}
              </DialogTitle>
              <DialogDescription>
                Pay <strong>{pkr(Number(fine.amount))}</strong> to OPay{" "}
                <strong>03371441111</strong> or Mashreq Bank{" "}
                <strong>089120147898</strong>, then upload the payment screenshot below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {fine.reason && (
                <div className="rounded-lg bg-muted/60 border px-3 py-2 text-sm">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">Reason: </span>
                  {fine.reason}
                </div>
              )}
              <div className="rounded-lg border bg-muted/50 px-3 py-2.5 text-sm space-y-1">
                <div className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Pay to:</div>
                <div className="font-mono">OPay — 03371441111</div>
                <div className="font-mono">Mashreq Bank — 089120147898</div>
              </div>
              <div>
                <Label>Payment Screenshot</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {file && (
                  <p className="text-xs text-emerald-600 mt-1">✓ {file.name}</p>
                )}
              </div>
              <Button
                onClick={submitProof}
                disabled={busy || !file}
                className="w-full"
                variant="destructive"
              >
                {busy ? "Submitting…" : "Submit Proof"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Admin will verify and clear your fine within a few hours.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
