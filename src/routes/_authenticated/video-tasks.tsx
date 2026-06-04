import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/feature/file-upload";
import { SecureVideoPlayer } from "@/components/feature/secure-video-player";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/video-tasks")({
  head: () => ({ meta: [{ title: "Video Tasks — Expert Solutions" }] }),
  component: VideoTasksPage,
});

function VideoTasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["video-tasks"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data } = await supabase.from("tasks").select("*")
        .eq("assigned_to", u.user.id)
        .eq("task_type", "video")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Video Tasks</h1>
        <p className="text-muted-foreground mt-1">Watch the required videos to unlock the proof submission.</p>
      </div>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> :
        !data?.length ? <Card className="glass"><CardContent className="py-10 text-center text-muted-foreground">No video tasks assigned.</CardContent></Card> :
        <div className="grid gap-3">{data.map((t) => <VideoTaskCard key={t.id} task={t} />)}</div>
      }
    </div>
  );
}

function VideoTaskCard({ task }: { task: any }) {
  const videos: string[] = Array.isArray(task.video_links) ? task.video_links : [];
  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{task.title}</CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <Badge variant="secondary">{Number(task.reward).toFixed(2)} {task.currency}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <VideoTaskBody task={task} videos={videos} />
      </CardContent>
    </Card>
  );
}

function VideoTaskBody({ task, videos }: { task: any; videos: string[] }) {
  const qc = useQueryClient();
  const { data: progress } = useQuery({
    queryKey: ["video-progress", task.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_video_watch_progress", { _task_id: task.id });
      return data as { watched: string[]; total: number };
    },
  });
  const watched = new Set(progress?.watched ?? []);
  const allWatched = videos.length > 0 && videos.every((v) => watched.has(v));

  async function markWatched(url: string) {
    await supabase.rpc("log_video_watch", { _task_id: task.id, _video_url: url });
    qc.invalidateQueries({ queryKey: ["video-progress", task.id] });
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {videos.map((v) => (
          <div key={v} className="space-y-1">
            <SecureVideoPlayer src={v} onComplete={() => markWatched(v)} />
            {watched.has(v) && <p className="text-xs text-success inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Watched</p>}
          </div>
        ))}
      </div>
      {task.status === "assigned" || task.status === "rejected" ? (
        allWatched ? <SubmitProof task={task} /> : <p className="text-sm text-muted-foreground">Finish watching all videos to unlock proof submission.</p>
      ) : <p className="text-sm">Status: <span className="font-medium">{task.status}</span></p>}
    </div>
  );
}

function SubmitProof({ task }: { task: any }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [proof, setProof] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    const { data, error } = await supabase.rpc("submit_task_v2", {
      _task_id: task.id, _text: text, _url: "", _proof_files: proof ? [proof] : [],
    });
    setSaving(false);
    if (error || !(data as any)?.success) toast.error((data as any)?.error ?? error?.message ?? "Failed");
    else { toast.success("Submitted"); setOpen(false); qc.invalidateQueries(); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Submit proof</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Submit proof</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Note</Label><Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} /></div>
          <div><Label>Screenshot</Label>
            <FileUpload bucket="proof-uploads" pathPrefix={`${task.assigned_to}/${task.id}`} value={proof} onChange={setProof} />
          </div>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
