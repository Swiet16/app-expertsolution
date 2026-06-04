import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle2 } from "lucide-react";

interface Props {
  src: string;
  minWatchSeconds?: number;
  onComplete?: () => void;
}

export function SecureVideoPlayer({ src, minWatchSeconds = 0, onComplete }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const lastTimeRef = useRef(0);
  const watchedRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(0);
  const [duration, setDuration] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      const t = v.currentTime;
      const delta = t - lastTimeRef.current;
      if (delta > 0 && delta < 1.5) {
        watchedRef.current += delta;
        setWatched(watchedRef.current);
      } else if (delta >= 1.5) {
        // anti-skip — rewind
        v.currentTime = lastTimeRef.current;
      }
      lastTimeRef.current = v.currentTime;
    };
    const onSeek = () => {
      if (v.currentTime > lastTimeRef.current + 0.5) v.currentTime = lastTimeRef.current;
    };
    const onMeta = () => setDuration(v.duration || 0);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("seeking", onSeek);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("seeking", onSeek);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd);
    };
  }, []);

  useEffect(() => {
    if (!completed && minWatchSeconds > 0 && watched >= minWatchSeconds) {
      setCompleted(true);
      onComplete?.();
    } else if (!completed && minWatchSeconds === 0 && duration > 0 && watched >= duration * 0.9) {
      setCompleted(true);
      onComplete?.();
    }
  }, [watched, duration, minWatchSeconds, completed, onComplete]);

  const target = minWatchSeconds > 0 ? minWatchSeconds : Math.max(duration * 0.9, 1);
  const pct = Math.min(100, (watched / target) * 100);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <video
          ref={ref}
          src={src}
          className="w-full h-full"
          playsInline
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <button
            type="button"
            onClick={() => ref.current?.play()}
            className="absolute inset-0 grid place-items-center bg-black/40 text-white hover:bg-black/50 transition"
            aria-label="Play"
          >
            <Play className="h-14 w-14" />
          </button>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Watched {Math.floor(watched)}s {duration ? `/ ${Math.floor(target)}s` : ""}</span>
          {completed && <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</span>}
        </div>
        <Progress value={pct} />
      </div>
    </div>
  );
}
