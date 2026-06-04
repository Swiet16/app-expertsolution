import { cn } from "@/lib/utils";
import { LogoIcon } from "@/components/logo-icon";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "default" | "onPrimary";
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { icon: "h-9 w-9", text: "text-base", tag: "text-[10px]" },
  md: { icon: "h-11 w-11", text: "text-lg", tag: "text-[11px]" },
  lg: { icon: "h-14 w-14", text: "text-2xl", tag: "text-xs" },
  xl: { icon: "h-20 w-20", text: "text-3xl", tag: "text-sm" },
};

export function BrandLogo({
  className,
  size = "md",
  showTagline = false,
  variant = "default",
  showWordmark = false,
}: Props) {
  const s = sizeMap[size];
  const onPrimary = variant === "onPrimary";

  return (
    <div className={cn("flex items-center gap-2.5 group select-none", className)}>
      <div className="relative shrink-0">
        <span
          aria-hidden
          className="absolute -inset-2 rounded-2xl bg-gradient-to-tr from-cyan-400/40 via-primary/40 to-fuchsia-500/30 blur-xl opacity-60 group-hover:opacity-90 transition"
        />
        <LogoIcon
          className={cn(
            "relative rounded-[13px] drop-shadow-[0_0_14px_rgba(56,189,248,0.5)] ring-1 ring-white/10",
            s.icon,
          )}
        />
      </div>

      {showWordmark && (
        <div className="leading-tight">
          <div
            className={cn(
              "font-extrabold tracking-tight",
              s.text,
              onPrimary
                ? "text-primary-foreground"
                : "bg-gradient-to-r from-cyan-400 via-primary to-fuchsia-500 bg-clip-text text-transparent",
            )}
          >
            Expert<span className="ml-1 opacity-80">Solutions</span>
          </div>
          {showTagline && (
            <div
              className={cn(
                "uppercase tracking-[0.22em] font-medium",
                s.tag,
                onPrimary ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              Trading · Online Work · Consultancy
            </div>
          )}
        </div>
      )}
    </div>
  );
}
