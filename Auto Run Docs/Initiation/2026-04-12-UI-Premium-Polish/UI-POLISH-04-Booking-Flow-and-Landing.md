# Phase 04: Booking Flow and Landing Page

The booking flow is the primary conversion path customers experience, and the landing page is the first impression. Currently both suffer from flat, depthless interactive elements: date picker buttons and time slots have no selection pop or hover feedback, and the landing hero heading doesn't leverage the bold DM Sans weights we unlocked in Phase 01. This phase adds tactile depth to every picker interaction, promotes the landing hero to an expressive display heading, and fixes two known bugs (Done button missing `glossy-btn`, progress bar animation already works — confirmed in audit so no change needed there).

## Tasks

- [ ] Upgrade the landing page hero in `src/app/page.tsx`:
  - Hero `<h1>` (line 204): change `text-4xl font-display font-bold` to use the fluid clamp utility added in Phase 01:
    ```tsx
    <h1 className="text-display-fluid font-display font-black text-foreground leading-[1.1] tracking-tighter mb-4">
      Premium Car Wash,<br />Fourways
    </h1>
    ```
  - Section heading "Our Wash Packages" (line 225): change `text-xl font-display font-semibold` to `text-2xl font-display font-bold tracking-tight`
  - The decorative divider line below it (line 228, `w-10 h-0.5`) is good — keep it
  - The `<Sparkles>` + brand label row (lines 198-202): add `tracking-widest` to the `uppercase` span for more refinement

- [ ] Elevate date picker buttons in `src/app/page.tsx` (lines 326-339, the `step === "date"` block):
  - Current classes on each date button:
    ```
    "rounded-xl border p-3 text-center transition-all"
    ```
  - Replace with a layered surface treatment:
    ```tsx
    className={cn(
      "rounded-xl p-3 text-center transition-all duration-150 focus-ring",
      "border glass-surface hover:-translate-y-0.5 hover:shadow-card-md active:scale-[0.97]",
      selectedDate === d.value
        ? "border-accent bg-gradient-to-br from-accent/8 to-accent/4 shadow-card-md ring-1 ring-accent/20"
        : "border-white/50 hover:border-accent/30"
    )}
    ```
  - Day label `<p>`: add `font-semibold` when selected (`selectedDate === d.value ? "font-semibold text-accent" : "font-medium text-foreground"`)
  - Date `<p>`: already `text-xs text-muted-foreground` — keep as-is

- [ ] Elevate time slot buttons in `src/app/page.tsx` (lines 359-375, the `step === "time"` grid):
  - Current available+selected classes include `border-accent bg-accent/5 text-accent`
  - Replace the full `className` expression with a richer treatment:
    ```tsx
    className={cn(
      "h-12 rounded-lg border text-sm font-medium transition-all duration-150 focus-ring",
      !slot.available && "opacity-30 cursor-not-allowed bg-muted border-border text-muted-foreground",
      slot.available && selectedTime === slot.time
        ? "border-accent bg-gradient-to-br from-accent/10 to-accent/5 text-accent shadow-card-md ring-1 ring-accent/25 font-semibold -translate-y-0.5"
        : slot.available
        ? "border-white/50 glass-surface text-foreground hover:border-accent/30 hover:-translate-y-0.5 hover:shadow-card-sm active:scale-[0.97]"
        : "border-border text-muted-foreground"
    )}
    ```

- [ ] Fix the confirmation screen Done button and upgrade the step heading in `src/app/page.tsx`:
  - Done button (line 176-179): replace `h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium` with `glossy-btn` pattern:
    ```tsx
    <button
      onClick={resetBooking}
      className="h-12 px-8 rounded-xl glossy-btn text-accent-foreground font-semibold inline-flex items-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-ring"
    >
      Done
    </button>
    ```
  - Confirmation `<h1>` (line 144): change `text-2xl font-display font-bold` to `text-3xl font-display font-black tracking-tight`
  - The booking step headings (`<h2>` on lines 302, 323, 347, 386 — "Choose your wash", "Pick a date", "Select a time", "Your details"): change all from `text-xl font-display font-semibold` to `text-2xl font-display font-bold tracking-tight` for consistency

- [ ] Add hover+interaction depth to the `src/components/shared/wash-tier-card.tsx` component:
  - First read the file to understand its current structure
  - Find the root interactive element (the card button or wrapper) and upgrade its surface to:
    - Unselected: `glass-card hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.99] transition-all duration-150`
    - Selected: add `ring-2 ring-accent/40 shadow-card-lg -translate-y-0.5` to the selected state
  - If there is a price display element, ensure it uses `font-bold tabular-nums` and is in `text-accent` or accent-adjacent color when selected
  - The component is used in both the landing page and booking flow — changes apply everywhere without requiring caller-side changes
