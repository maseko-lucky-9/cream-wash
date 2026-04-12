# Phase 03: Staff Dashboard

The Staff Dashboard is an operational screen used under time pressure — clarity of hierarchy is everything. Currently Bay Board and Queue share identical heading styles and equal grid weight, making it impossible to read priority at a glance. This phase gives Bay Board unmistakable visual primacy (larger, bolder heading with an accent marker), adds depth and stagger to individual queue items, and ensures the empty-state and count badge are polished enough to survive a live demo.

## Tasks

- [ ] Elevate the Bay Board section header in `src/app/staff/page.tsx` to signal operational priority:
  - Current heading (line 184): `font-display font-semibold text-lg text-foreground`
  - Change to: `font-display font-black text-2xl text-foreground tracking-tight`
  - The icon alongside it (line 183, `LayoutGrid`): change from `w-5 h-5 text-muted-foreground` to `w-6 h-6 text-accent`
  - Wrap the heading `<div>` in a left-border accent bar:
    ```tsx
    <div className="flex items-center gap-3 mb-4 pl-3 border-l-2 border-accent/60">
      <LayoutGrid className="w-6 h-6 text-accent" />
      <h2 className="font-display font-black text-2xl text-foreground tracking-tight">
        Bay Board
      </h2>
    </div>
    ```
  - This pattern (left border accent + icon + heavy heading) is a visual anchor — only the Bay Board gets it; Queue gets a lighter treatment

- [ ] Update the Queue section header in `src/app/staff/page.tsx` to a supporting style (different from Bay Board but still elevated from current):
  - Current heading (line 204): `font-display font-semibold text-lg text-foreground`
  - Change to: `font-display font-bold text-xl text-foreground tracking-tight`
  - Current icon (line 203, `Users`): change from `w-5 h-5 text-muted-foreground` to `w-5 h-5 text-muted-foreground/70`
  - The queue count badge (line 207, `{queue.length} waiting`): upgrade from plain text to a pill badge:
    ```tsx
    <span className="ml-auto px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold tabular-nums">
      {queue.length} waiting
    </span>
    ```

- [ ] Add staggered entrance animations to the bay cards and queue items in `src/app/staff/page.tsx`:
  - Bay cards (lines 188-192, `{bays.map(...)}`): wrap each `<BayCard>` in a div with stagger class:
    ```tsx
    {bays.map((bay, i) => (
      <div
        key={bay.id}
        className={["animate-fade-up-1","animate-fade-up-2","animate-fade-up-3","animate-fade-up-4"][Math.min(i, 3)]}
      >
        <BayCard ... />
      </div>
    ))}
    ```
  - Queue items (lines 223-232, `{queue.map(...)}`): same pattern:
    ```tsx
    {queue.map((job, i) => (
      <div
        key={job.id}
        className={["animate-fade-up-1","animate-fade-up-2","animate-fade-up-3","animate-fade-up-4"][Math.min(i, 3)]}
      >
        <QueueItem ... />
      </div>
    ))}
    ```
  - The keyframes for `fade-up-1` through `fade-up-4` exist in `tailwind.config.ts` — no new config required

- [ ] Add visual depth and interactive states to `src/components/shared/queue-item.tsx`:
  - First, read the file to understand its current structure before editing
  - Find the root card `<div>` or `<button>` element and upgrade its surface styling from a flat `border` + `bg-white/bg-card` pattern (whatever is there) to use `glass-card` and add a hover state:
    ```
    glass-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200
    ```
  - Find the "Assign" or action button inside the component and ensure it uses `glossy-btn` class (same as all other CTAs in the project) — if it uses `bg-accent` or `bg-primary`, replace with `glossy-btn text-accent-foreground`
  - If the component has a queue position number badge, ensure it has `tabular-nums font-bold text-accent` styling

- [ ] Refine the empty queue state in `src/app/staff/page.tsx` (lines 213-221):
  - The empty state currently uses `glass-surface` for the icon circle — keep that but improve the surrounding card:
  - Wrap the entire empty state `<div>` in a `glass-card` container with `rounded-2xl p-8`:
    ```tsx
    <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">
      <div className="w-12 h-12 rounded-full glass-surface flex items-center justify-center mx-auto mb-3">
        <Users className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="font-medium text-foreground/80">No cars waiting</p>
      <p className="text-sm mt-1">Cars will appear here when customers check in or book.</p>
    </div>
    ```
  - Increase the main grid gap: `md:gap-6` → `md:gap-8` on the `<main>` wrapper `md:grid md:grid-cols-2` div (line 179)
