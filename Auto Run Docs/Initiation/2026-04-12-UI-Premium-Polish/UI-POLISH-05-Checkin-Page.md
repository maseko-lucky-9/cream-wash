# Phase 05: Check-In Page

The walk-in check-in screen (`/checkin`) is shown on a tablet or shared device at the front desk. It was entirely absent from the original polish plan — a gap identified in the second spot-check. Two critical issues: (1) the confirmation screen after check-in has no exit action, leaving users stranded with no way to check in the next car without refreshing; (2) the header and tier-selection step have no stagger entrance. This phase fixes both and applies the same surface depth already established on booking flow controls.

## Tasks

- [ ] Add an exit CTA to the check-in confirmation screen in `src/app/checkin/page.tsx` (lines 75-111):
  - The screen currently ends at line 107 with a static `<p>` and no interactive element
  - After that `<p>`, add two action buttons below the queue/wait info cards:
    ```tsx
    <div className="flex flex-col gap-3 w-full max-w-sm mt-8">
      <button
        onClick={() => {
          setStep("tier");
          setSelectedTier(null);
          setName("");
          setPhone("");
          setErrors({});
        }}
        className="h-14 rounded-xl glossy-btn text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 focus-ring text-base"
      >
        Check In Another Car
      </button>
      <p className="text-xs text-muted-foreground text-center">
        Please wait in the bay area — we will call your name.
      </p>
    </div>
    ```
  - Remove the existing static `<p className="text-sm text-muted-foreground">Please wait...</p>` (line 106-108) since it is replaced by the text inside the new block above
  - The reset logic mirrors `resetBooking()` in the booking flow — inline it here rather than extracting a helper, since the component is self-contained

- [ ] Upgrade the confirmation screen's queue position and wait cards in `src/app/checkin/page.tsx` (lines 88-104):
  - Both cards currently use `rounded-xl glass-card p-6 text-center` — keep `glass-card` and `rounded-xl` but:
    - Queue position card: add `animate-fade-up-1` entrance and `shadow-card-lg`
    - Wait time card: add `animate-fade-up-2` entrance
    - Queue position value (`text-kpi`): already uses `text-accent` — add `font-black` and `tracking-tight` to make the number more imposing
  - The `<h1>` "You are checked in" (line 82): change `text-2xl font-display font-bold` to `text-3xl font-display font-black tracking-tight`

- [ ] Add staggered entrance and depth to the tier selection step in `src/app/checkin/page.tsx` (lines 134-145):
  - Wrap each `<WashTierCard>` in an entrance animation div:
    ```tsx
    {tiers.map((tier, i) => (
      <div
        key={tier.id}
        className={["animate-fade-up-1","animate-fade-up-2","animate-fade-up-3"][Math.min(i, 2)]}
      >
        <WashTierCard
          tier={tier}
          selected={selectedTier?.id === tier.id}
          onSelect={handleTierSelect}
        />
      </div>
    ))}
    ```
  - The `WashTierCard` upgrades from Phase 04 apply here automatically since it is the same component

- [ ] Polish the check-in page header and details step in `src/app/checkin/page.tsx`:
  - Header section (lines 117-130):
    - Brand label span (line 120): add `tracking-widest` to the `uppercase` span (matches landing page treatment from Phase 04)
    - `<h1>` "Walk-In Check-In" (line 124): change `text-2xl font-display font-bold` to `text-3xl font-display font-black tracking-tight`
  - Details step "Change wash" back-link button (line 152): style it properly — replace plain text with:
    ```tsx
    <button
      onClick={() => setStep("tier")}
      className="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:text-accent/80 transition-colors mb-4 focus-ring rounded-md"
    >
      <ChevronLeft className="w-4 h-4" />
      {selectedTier?.name} — Change
    </button>
    ```
    Import `ChevronLeft` from `lucide-react` (check if already imported at the top of the file; if not, add it)
  - Both input fields in the details step already have the correct glass styling — no change needed there
