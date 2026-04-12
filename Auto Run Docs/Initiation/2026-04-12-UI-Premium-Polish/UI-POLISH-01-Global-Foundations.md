# Phase 01: Global Foundations

This phase patches the lowest-level shared code so every subsequent phase can build on a correct base. It fixes the DM Sans font URL to unlock weight-800/900 (required for expressive display text everywhere), adds the `bar-enter` chart keyframe to `tailwind.config.ts`, wires a page-level fade+slide entrance into `layout.tsx`, and adds custom scrollbar, focus-visible ring, and fluid-type-clamp utilities to `globals.css`. Nothing visual will break; the only observable output is that reloading the app now shows a 300ms fade+slide entrance on every route.

## Tasks

- [ ] Update the DM Sans Google Fonts `@import` in `src/app/globals.css` line 1 to include weights 800 and 900:
  - Replace the existing import URL (currently `wght@500;600;700`) with:
    `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');`
  - This is a variable-font URL form that covers the full weight axis — `font-black` and `font-extrabold` classes will now render correctly for DM Sans

- [ ] Add the `bar-enter` keyframe and animation token to `tailwind.config.ts`:
  - Add to the `keyframes` object:
    ```ts
    "bar-enter": {
      "0%":   { transform: "scaleY(0)", transformOrigin: "bottom", opacity: "0" },
      "60%":  { opacity: "1" },
      "100%": { transform: "scaleY(1)", transformOrigin: "bottom", opacity: "1" },
    },
    ```
  - Add to the `animation` object:
    ```ts
    "bar-enter": "bar-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    ```
  - Do NOT add `animate-stagger-*` variants — `animate-fade-up-1` through `animate-fade-up-4` already cover staggering (80ms / 160ms / 240ms / 320ms delays). Only add what is missing.

- [ ] Add page-level entrance animation to `src/app/layout.tsx`:
  - The `<body>` currently renders `{children}` directly (line 29). Wrap children in a transition div:
    ```tsx
    <div className="animate-page-enter">
      {children}
    </div>
    ```
  - Add the `page-enter` keyframe and animation token to `tailwind.config.ts` (do this in the same edit pass as the `bar-enter` addition above — one file, one edit):
    ```ts
    // keyframes:
    "page-enter": {
      "0%":   { opacity: "0", transform: "translateY(10px)" },
      "100%": { opacity: "1", transform: "translateY(0)" },
    },
    // animation:
    "page-enter": "page-enter 0.3s ease-out both",
    ```
  - Keep the `<Toaster>` outside the wrapper so toasts don't re-animate on navigation

- [ ] Add custom scrollbar, focus-visible ring, and fluid-type-clamp utilities to `src/app/globals.css` in the existing `@layer utilities` block:
  - **Custom scrollbar** (applies to overflow containers, not the global body):
    ```css
    .scrollbar-warm::-webkit-scrollbar        { width: 4px; height: 4px; }
    .scrollbar-warm::-webkit-scrollbar-track  { background: transparent; }
    .scrollbar-warm::-webkit-scrollbar-thumb  { background: rgba(180, 100, 20, 0.25); border-radius: 9999px; }
    .scrollbar-warm::-webkit-scrollbar-thumb:hover { background: rgba(180, 100, 20, 0.4); }
    ```
  - **Focus-visible ring override** (replaces browser default blue ring with amber):
    ```css
    .focus-ring {
      @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background;
    }
    ```
  - **Fluid display type utility** (clamp between 1.75rem at narrow and 3.5rem at wide):
    ```css
    .text-display-fluid {
      font-size: clamp(1.75rem, 4vw, 3.5rem);
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    ```
  - These are additive utilities only — they don't change any existing rule
