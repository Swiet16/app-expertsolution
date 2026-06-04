import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Expert Solutions" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["reviews-approved"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .or(uid ? `status.eq.approved,reviewer_id.eq.${uid}` : "status.eq.approved")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  async function submit() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return toast.error("Sign in first");
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      reviewer_id: u.user.id, reviewee_id: u.user.id, rating, title, content, image_urls: [],
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Review submitted for approval"); setTitle(""); setContent(""); qc.invalidateQueries(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground mt-1">Share your experience. Reviews are moderated before publishing.</p>
      </div>
      <Card className="glass">
        <CardHeader><CardTitle>Write a review</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Rating</Label>
            <div className="flex gap-1 mt-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Your review</Label><Textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} /></div>
          <Button onClick={submit} disabled={saving}>Submit</Button>
        </CardContent>
      </Card>
      <div>
        <h2 className="text-lg font-semibold mb-3">Community reviews</h2>
        <div className="grid gap-3">
          {!reviews?.length ? <p className="text-sm text-muted-foreground">No reviews yet.</p> :
            reviews.map((r) => (
              <Card key={r.id} className="glass">
                <CardContent className="py-4">
                  <div className="flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    ))}
                    </div>
                    {r.status !== "approved" && (
                      <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{r.status}</span>
                    )}
                  </div>
                  {r.title && <div className="font-medium mt-1">{r.title}</div>}
                  {r.content && <p className="text-sm text-muted-foreground mt-1">{r.content}</p>}
                </CardContent>
              </Card>
            ))
          }
        </div>
      </div>
    </div>
  );
}
