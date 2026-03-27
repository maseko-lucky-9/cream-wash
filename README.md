# Cream Wash - Premium Car Wash PWA

A mobile-first Progressive Web App for Cream Car Wash (Fourways, Gauteng, South Africa). Built as a sales demo to prove digital car tracking, queue management, and real-time revenue visibility.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + custom design system (warm cream theme)
- **Database:** Supabase (PostgreSQL + Realtime)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Auth:** Custom 4-digit PIN (bcrypt hashed)
- **Package Manager:** pnpm
- **Deployment:** Vercel

## Features

### P0 (Must Have)
- Staff Dashboard (`/staff`) - PIN login, bay board with real-time status, queue management, assign car to bay, mark job complete
- Customer Landing + Booking (`/`) - Hero page, wash tier cards, multi-step booking flow
- Walk-in QR Check-in (`/checkin`) - Tier selection, name/phone form, queue confirmation
- Owner Dashboard (`/owner`) - PIN login, 4 KPI cards, bay status, real-time updates
- Seed Data API (`GET /api/seed`) - Demo data (~25 cars today + 7 days history)
- Supabase Realtime - Live bay/job updates across all views

### P1 (Should Have)
- 7-day revenue bar chart (Recharts)
- Wash history log (scrollable list of today's completed washes)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd cream-wash
pnpm install
```

### 2. Supabase setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run the migration file:

```
supabase/migration.sql
```

This creates all tables, views, indexes, RLS policies, and enables realtime.

3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Seed demo data

```bash
pnpm dev
# Then visit http://localhost:3000/api/seed
```

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo PINs

| Role  | Name   | PIN  |
|-------|--------|------|
| Staff | Sipho  | 1234 |
| Staff | Thandi | 5678 |
| Owner | Owner  | 0000 |

## Routes

| Route      | Purpose                          |
|------------|----------------------------------|
| `/`        | Customer landing + booking flow  |
| `/checkin` | Walk-in QR check-in              |
| `/staff`   | Staff dashboard (PIN protected)  |
| `/owner`   | Owner dashboard (PIN protected)  |
| `/api/seed`| Seed demo data                   |

## Currency and Locale

- All prices in ZAR (South African Rand), formatted as "R1,234"
- Prices stored in cents (e.g., R80 = 8000)
- All times in Africa/Johannesburg (SAST, UTC+2)

## Deploy to Vercel

1. Push to GitHub
2. Import into Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## E2E Tests

```bash
pnpm exec playwright install
pnpm exec playwright test
```

## Design System

- Background: `#FFFBF5` (warm cream)
- Accent: `#B45309` (amber)
- Fonts: DM Sans (display), Inter (body), JetBrains Mono (PIN)
- Touch targets: 56px staff primary, 48px general
- Mobile-first: 375px+ viewport
