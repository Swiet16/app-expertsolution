import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

/**
 * Browser push (foreground/PWA) notifications.
 * - Asks permission once, persists choice in localStorage.
 * - Subscribes to Supabase Realtime on `notifications` for the current user.
 * - Fires a native Notification on insert (works while a tab/PWA is open).
 */
export function PushNotifications({ userId }: { userId: string | undefined }) {
  const [perm, setPerm] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "denied",
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as { title?: string; body?: string };
          try {
            const notif = new Notification(n.title ?? "New notification", {
              body: n.body ?? "",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: `notif-${Date.now()}`,
            });
            notif.onclick = () => {
              window.focus();
              navigate({ to: "/notifications" });
            };
          } catch {
            /* ignore */
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, perm, navigate]);

  if (typeof window === "undefined" || !("Notification" in window)) return null;
  if (perm === "granted" || localStorage.getItem("push-dismissed") === "1") return null;

  async function enable() {
    const result = await Notification.requestPermission();
    setPerm(result);
    if (result === "granted") new Notification("Notifications enabled", { body: "You'll see real-time updates here." });
    else localStorage.setItem("push-dismissed", "1");
  }

  return (
    <Button size="sm" variant="outline" onClick={enable} className="gap-2">
      <Bell className="h-4 w-4" /> Enable push
    </Button>
  );
}