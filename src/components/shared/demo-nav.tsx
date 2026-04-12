"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, QrCode, Users, BarChart3, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  { label: "Customer", path: "/", icon: Home },
  { label: "Check-in", path: "/checkin", icon: QrCode },
  { label: "Staff", path: "/staff", icon: Users },
  { label: "Owner", path: "/owner", icon: BarChart3 },
] as const;

export function DemoNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed");
      const data = await res.json();
      if (res.ok) toast.success("Demo data reset");
      else toast.error(data.error || "Seed failed");
    } catch {
      toast.error("Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div
      role="navigation"
      aria-label="Demo scenario switcher"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0.5 rounded-full glass-card px-1.5 py-1.5"
      style={{ boxShadow: "0 4px 20px rgba(28,25,23,0.12), 0 1px 4px rgba(28,25,23,0.06), inset 0 1px 0 rgba(255,255,255,0.7)" }}
    >
      <span className="text-[9px] font-mono font-semibold text-muted-foreground/50 tracking-[0.18em] uppercase pl-2.5 pr-2 select-none">
        demo
      </span>
      <div className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />

      {SCENARIOS.map(({ label, path, icon: Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => router.push(path)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium transition-all duration-150",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] active:bg-foreground/[0.07]"
            )}
          >
            <Icon className="w-3 h-3 shrink-0" strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}

      <div className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />

      <button
        onClick={handleSeed}
        disabled={seeding}
        title="Reset demo data"
        aria-label="Reset demo data"
        className="flex items-center gap-1.5 h-8 px-3 rounded-full text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04] active:bg-foreground/[0.07] transition-all duration-150 disabled:opacity-40"
      >
        <RefreshCw className={cn("w-3 h-3 shrink-0", seeding && "animate-spin")} strokeWidth={2} />
        <span>Seed</span>
      </button>
    </div>
  );
}
