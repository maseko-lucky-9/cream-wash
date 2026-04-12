# Phase 02: Owner Dashboard

The Owner Dashboard is the primary stakeholder screen — it must convey authority and clarity at a glance. This phase promotes Revenue to a visually dominant hero KPI (wider, larger type), replaces the generic `<Loader2>` spinner with an elegant skeleton grid that matches the final card layout, adds entrance animation to the bar chart, and tightens the section typography hierarchy. By the end, the dashboard feels purpose-built rather than scaffolded.

## Tasks

- [ ] Add `variant` prop to `src/components/shared/kpi-card.tsx` to support a hero display mode:
  - Extend the `KpiCardProps` interface:
    ```ts
    variant?: "default" | "hero";
    ```
  - Accept `variant = "default"` in the function signature
  - When `variant === "hero"`, apply these differences vs default:
    - Card padding: `p-5` instead of `p-4`
    - Icon container: `w-10 h-10 rounded-xl` instead of `w-8 h-8 rounded-lg`
    - Icon size: `w-5 h-5` instead of `w-4.5 h-4.5`
    - Label: `text-sm` instead of `text-kpi-label`
    - Value `<p>`: replace `text-kpi` with `text-[2.25rem] leading-[1.1] font-black tracking-tight` (larger than the `3rem text-kpi` token — no, wait: the hero should be *more* prominent, so use `text-[2.75rem] leading-[1.05] font-black tracking-tight font-display`)
    - Add a subtle bottom border: `border-b border-accent/10 pb-3 mb-3` between the icon row and the value row when hero
  - The default variant must be pixel-identical to the current behaviour — do not change default rendering

- [ ] Create `src/components/ui/skeleton.tsx` — a reusable shimmer skeleton primitive:
  ```tsx
  import { cn } from "@/lib/utils";

  export function Skeleton({ className }: { className?: string }) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted/60",
          "after:absolute after:inset-0 after:bg-gradient-to-r",
          "after:from-transparent after:via-white/30 after:to-transparent",
          "after:animate-shimmer",
          className
        )}
      />
    );
  }
  ```
  The `shimmer` keyframe (`translateX -100% → 100%`) and `animation: shimmer 2s ease-in-out infinite` already exist in `tailwind.config.ts` — no new config needed.

- [ ] Replace the `<Loader2>` spinner in `src/app/owner/page.tsx` (lines 118-121) with a skeleton KPI grid that mirrors the real layout:
  - Import `Skeleton` from `@/components/ui/skeleton`
  - Replace the `flex items-center justify-center py-16` spinner block with:
    ```tsx
    <div className="md:grid md:grid-cols-[1fr_auto] md:gap-6 md:items-start">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="col-span-2 h-[120px]" />  {/* Revenue hero placeholder */}
        <Skeleton className="h-[88px]" />
        <Skeleton className="h-[88px]" />
        <Skeleton className="h-[88px]" />
      </div>
      <div className="mt-6 md:mt-0 md:min-w-[180px] space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-[60px]" />
        <Skeleton className="h-[60px]" />
        <Skeleton className="h-[60px]" />
      </div>
    </div>
    ```
  - This skeleton matches the real content structure so the transition from loading → loaded avoids layout shift

- [ ] Restructure the KPI grid in `src/app/owner/page.tsx` to make Revenue the hero card:
  - **Move Revenue first in DOM order** (currently it is second after Cars Today — `col-span-2` only works cleanly when Revenue is first)
  - Change the grid wrapper from `grid-cols-2` to `grid-cols-2` with Revenue spanning both columns:
    ```tsx
    <div className="grid grid-cols-2 gap-3">
      {/* Revenue — hero, full width */}
      <KpiCard
        className="col-span-2"
        variant="hero"
        label="Revenue"
        value={data.total_revenue_cents}
        format={(v) => formatZAR(v)}
        icon={DollarSign}
        color="text-accent"
      />
      {/* Secondary KPIs */}
      <KpiCard label="Cars Today"      value={data.cars_washed}           icon={Car}      color="text-foreground" />
      <KpiCard label="Avg Wait"        value={data.avg_wait_minutes}       format={(v) => `${v} min`} icon={Clock} color="text-status-waiting" />
      <KpiCard label="Bay Utilization" value={data.bay_utilization_pct}    format={(v) => `${v}%`}    icon={BarChart3} color="text-status-active" />
    </div>
    ```
  - Pass `className` through `KpiCardProps` so `col-span-2` can be applied from the parent:
    - Add `className?: string` to `KpiCardProps` and spread it onto the root `<div>` using `cn()`

- [ ] Add entrance animation and animated properties to `src/components/shared/revenue-chart.tsx`:
  - On the `<Bar>` element (line 124), add:
    ```tsx
    isAnimationActive={true}
    animationDuration={600}
    animationEasing="ease-out"
    ```
  - Add a `label` component to the today bar to show the value above it on hover — use Recharts' `activeBar` prop to style the active state:
    ```tsx
    activeBar={{ fill: "url(#barGradientToday)", filter: "brightness(1.08)", radius: [6, 6, 0, 0] }}
    ```
  - Upgrade the chart container: change `height={200}` to `height={220}` for slightly more breathing room
  - On the wrapping `<div>` (line 87), add `animate-fade-up-3` so the chart enters after the KPI cards

- [ ] Upgrade section typography and vertical rhythm in `src/app/owner/page.tsx`:
  - Section headings (`h2` on lines 179 and 189) — change from `font-semibold text-lg` to `font-display font-bold text-xl tracking-tight`
  - Add `pt-2` to each `<section>` wrapper to give them more breathing space above the dividers
  - The `<main>` wrapper (line 117) has `space-y-6` — increase to `space-y-8` for more vertical rhythm
  - Header brand name (line 104) — change from `font-semibold` to `font-bold` and add `tracking-tight`
