## Project

**Cream Wash** — sales demo PWA for a premium car wash business (Fourways, Gauteng, ZA). Purpose: prove digital car tracking, queue management, and real-time revenue visibility to a prospective client. Not production; demo data via `/api/seed`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router + TypeScript |
| Styling | Tailwind CSS + custom design system (warm cream/amber) |
| Database | Supabase (PostgreSQL + Realtime) |
| Charts | Recharts |
| Auth | Custom 4-digit PIN (bcrypt) |
| Package manager | pnpm |
| Deployment | Vercel |
| E2E tests | Playwright (`tests/e2e/`) |

---

## Key Conventions

- **Currency**: ZAR only. Prices stored in cents (`R80 = 8000`). Display format: `R1,234`.
- **Timezone**: All times in `Africa/Johannesburg` (SAST, UTC+2). Use `date-fns` with explicit tz.
- **Design system**: Background `#FFFBF5` (cream-50), accent `#B45309` (amber). Fonts: DM Sans (display), Inter (body), JetBrains Mono (PIN). Touch targets: 56px staff primary, 48px general. Mobile-first at 375px+.
- **Tailwind tokens**: Use semantic tokens (`cream-*`, `gold-*`, `status.idle/active/waiting`) — never raw hex in JSX.
- **Components**: `src/components/ui/` for primitives, `src/components/shared/` for cross-route components.
- **Supabase client**: instantiate via `src/lib/supabase.ts`. Types auto-generated in `src/lib/database.types.ts` — regenerate with `pnpm supabase gen types` after schema changes.
- **Auth flow**: PIN hashed with bcrypt server-side; no NextAuth/sessions. Staff and Owner roles are separate PIN sets.

---

## Routes

| Route | Role |
|---|---|
| `/` | Customer landing + booking |
| `/checkin` | Walk-in QR check-in |
| `/staff` | Staff dashboard (PIN protected) |
| `/owner` | Owner dashboard (PIN protected) |
| `/api/seed` | Reset and populate demo data |

---

## Constraints

- **Demo only** — no real payment flow; prices are illustrative.
- **No docker-compose** — local dev uses `pnpm dev` + remote Supabase project.
- **Env vars**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` required. Copy `.env.example` → `.env.local`.
- **Vercel deploy**: stateless functions only; no durable server state outside Supabase.
