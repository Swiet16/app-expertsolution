import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet — Expert Solutions" }] }),
  component: WalletPage,
});

function WalletPage() {
  const qc = useQueryClient();
  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("wallets").select("*").eq("user_id", u.user.id).maybeSingle();
      return data;
    },
  });
  const { data: withdrawals } = useQuery({
    queryKey: ["withdrawals"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase.from("withdrawals").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-1">Available balance and withdrawals.</p>
        </div>
        <WithdrawDialog max={Number(wallet?.available_balance ?? 0)} onDone={() => qc.invalidateQueries()} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Available" value={Number(wallet?.available_balance ?? 0)} />
        <Stat label="Pending" value={Number(wallet?.pending_balance ?? 0)} />
        <Stat label="Total earned" value={Number(wallet?.total_earned ?? 0)} />
        <Stat label="Withdrawn" value={Number(wallet?.total_withdrawn ?? 0)} />
      </div>
      <Card className="glass">
        <CardHeader><CardTitle>Withdrawal history</CardTitle></CardHeader>
        <CardContent>
          {!withdrawals?.length ? <p className="text-muted-foreground text-sm">No withdrawals yet.</p> :
            <div className="space-y-2">
              {withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between border rounded-md px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium">${Number(w.amount).toFixed(2)} via {w.method}</div>
                    <div className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleString()}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{w.status}</span>
                </div>
              ))}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="glass shadow-elegant">
      <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground font-medium">{label}</CardTitle></CardHeader>
      <CardContent><div className="text-2xl font-bold">${value.toFixed(2)}</div></CardContent>
    </Card>
  );
}

function WithdrawDialog({ max, onDone }: { max: number; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("easypaisa");
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error("Invalid amount");
    if (amt > max) return toast.error("Exceeds available");
    setSaving(true);
    const { data, error } = await supabase.rpc("request_withdrawal", {
      _amount: amt, _method: method, _details: { account, name } as any,
    });
    setSaving(false);
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success("Withdrawal requested"); setOpen(false); onDone(); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Request withdrawal</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Withdraw funds</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Amount (max ${max.toFixed(2)})</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easypaisa">Easypaisa</SelectItem>
                <SelectItem value="jazzcash">JazzCash</SelectItem>
                <SelectItem value="bank">Bank transfer</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Account / Email</Label><Input value={account} onChange={(e) => setAccount(e.target.value)} /></div>
          <div><Label>Account name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <Button onClick={submit} disabled={saving}>Submit request</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
