# Phase 06: Mobile Responsive

Mobile behaviour is the final polish layer — the demo may run on a phone or small tablet. Three things need work: the hero Revenue KPI card is `col-span-2` in a `grid-cols-2` layout, which works well on desktop but the three secondary KPIs below it should scroll horizontally on very small screens rather than stacking awkwardly; the chart is fixed-height and clips on narrow viewports; and a sweep of interactive touch targets is needed to confirm all meet the 44px minimum. This phase closes those gaps without breaking any desktop layout.

## Tasks

- [ ] Implement a mobile-optimised secondary KPI row in `src/app/owner/page.tsx`:
  - The hero Revenue card (`col-span-2`) must remain as a full-width block above — it is NOT part of the scroller
  - The three secondary KPIs (Cars Today, Avg Wait, Bay Utilization) should scroll horizontally on mobile and sit in a row on `md+`:
    - Change the KPI grid wrapper from `grid grid-cols-2 gap-3` to a two-section approach:
      ```tsx
      <div className="space-y-3">
        {/* Hero KPI — always full width */}
        <KpiCard
          variant="hero"
          label="Revenue"
          ...
        />
        {/* Secondary KPIs — horizontal scroll on mobile, 3-col grid on md+ */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-warm md:grid md:grid-cols-3 md:overflow-visible">
          <div className="flex-none w-[calc(50vw-1.5rem)] snap-start md:w-auto md:flex-auto">
            <KpiCard label="Cars Today" ... />
          </div>
          <div className="flex-none w-[calc(50vw-1.5rem)] snap-start md:w-auto md:flex-auto">
            <KpiCard label="Avg Wait" ... />
          </div>
          <div className="flex-none w-[calc(50vw-1.5rem)] snap-start md:w-auto md:flex-auto">
            <KpiCard label="Bay Utilization" ... />
          </div>
        </div>
      </div>
      ```
  - The `scrollbar-warm` utility was added in Phase 01 — use it here
  - On `md+` screens the `md:grid md:grid-cols-3 md:overflow-visible` classes convert the flex scroller back to a standard grid

- [ ] Make the revenue chart height responsive in `src/components/shared/revenue-chart.tsx`:
  - The `<ResponsiveContainer>` currently has fixed `height={220}` (set in Phase 02)
  - Replace with responsive height using a min-height on the container div and `height="100%"` on `ResponsiveContainer`:
    ```tsx
    <div className="rounded-xl glass-card p-4 animate-fade-up-3">
      <div className="h-[180px] md:h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          ...
        </ResponsiveContainer>
      </div>
    </div>
    ```
  - Also hide the Y-axis labels on narrow viewports by adding `hide` prop conditionally — since Recharts doesn't support responsive class-based hiding, use `width={0}` trick via a `useEffect` width check, OR simply reduce font size on small screens: change `tick={{ fontSize: 10 }}` to `tick={{ fontSize: 9 }}` and set `width={28}` on the `<YAxis>` so it doesn't crowd the bars
  - The `<XAxis>` labels are short enough (3-letter day names) to always show — keep them

- [ ] Audit and fix touch targets across all interactive elements:
  - **Booking flow — date picker buttons** (updated in Phase 04): currently `p-3` — verify the rendered height reaches 44px at 375px viewport width. If the `grid-cols-3` layout on mobile makes them too narrow, change to `grid-cols-4` on small and `grid-cols-7` on `sm+`:
    - Current: `grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7` — this is already correct, verify it renders tall enough. If not, add `min-h-[48px]` to each date button.
  - **Check-in CTA button** (Phase 05 added): `h-14` = 56px ✓
  - **Booking confirm CTA**: `h-12` = 48px ✓
  - **Staff logout button**: `h-10` = 40px — this is below the 44px threshold. Change to `h-11` (44px) on both `/owner` and `/staff` pages: update `h-10 px-3` → `h-11 px-4` on the logout button in both `src/app/owner/page.tsx` (line 109) and `src/app/staff/page.tsx` (line 170)
  - **Queue item assign button** in `src/components/shared/queue-item.tsx`: read the file and confirm the assign CTA is at least `h-10` (40px); if it is `h-8` or smaller, bump to `h-10` minimum

- [ ] Apply mobile typography scaling to the landing page hero in `src/app/page.tsx`:
  - The `text-display-fluid` utility from Phase 01 uses `clamp(1.75rem, 4vw, 3.5rem)` — verify this is correctly applied to the `<h1>` (done in Phase 04)
  - Navigation / back-button area in the booking flow header (lines 261-280): the `max-w-md mx-auto` container already centres correctly — no change needed
  - Booking step sub-headings were updated in Phase 04 to `text-2xl` — on very narrow screens (375px) `text-2xl` = 1.5rem which is fine
  - Footer text (lines 242-252): already `text-sm` — correct

- [ ] Final integration verification pass (no code changes — read-only diagnostic):
  - Read `src/app/owner/page.tsx`, `src/app/staff/page.tsx`, `src/app/page.tsx`, `src/app/checkin/page.tsx`, `src/app/globals.css`, `tailwind.config.ts`, and `src/components/shared/kpi-card.tsx` to confirm:
    1. DM Sans import includes weights 800 + 900
    2. `bar-enter` and `page-enter` keyframes exist in `tailwind.config.ts`
    3. Revenue KPI is first in DOM with `variant="hero"` and `col-span-2`-equivalent treatment
    4. `glossy-btn` is used on all primary CTAs (Done button, Confirm Booking, Check In, Check In Another Car)
    5. All `h2` section headings use `font-bold` or `font-black` + `tracking-tight`
    6. Check-in confirmation has a "Check In Another Car" button
  - If any of the above are missing, fix them in this task as targeted one-line patches
