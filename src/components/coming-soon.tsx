import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function ComingSoon({
  title,
  description,
  session,
}: {
  title: string;
  description: string;
  session: 2 | 3 | 4;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>
      <Card className="glass shadow-elegant">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-primary grid place-items-center text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Landing in Session {session}</CardTitle>
            <CardDescription>This module is scaffolded and protected. Full UI ships next.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>Route is live and auth-gated.</li>
            <li>Data layer uses server functions with Supabase RLS — no service role key required.</li>
            <li>Mobile-first layout already wired into the shell.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}