# Cream Wash — Demo Run-Sheet

**URL**: https://cream-wash.vercel.app  
**Pitch line**: *"You washed 23 cars today. That's R4,140. Bay 2 has been idle for 40 minutes."*

---

## Pre-Demo Setup (2 min before)

1. Open https://cream-wash.vercel.app/api/seed in a private tab — wait for `{"message":"Seed complete"}`.
2. Open 3 tabs: `/owner`, `/staff`, `/checkin` (leave `/` for the customer pitch at the end).
3. Clear localStorage if you demoed before: DevTools → Application → Local Storage → Clear All.

---

## Scene 1 — Owner Dashboard (3 min)

**URL**: `/owner` | **PIN**: `0000`

> *"This is what the owner sees first thing every morning."*

Walk through:

| KPI Card | Talking point |
|---|---|
| **Cars Today** | "23 washes done. Target is 30." |
| **Revenue** | "R4,140 so far — all tracked without a cashbook." |
| **Avg Wait** | "12 minutes. If this spikes, you know there's a bottleneck." |
| **Bay Utilization** | "67% — Bay 2 has been sitting idle for 40 minutes." |

- Scroll to **7-Day Revenue Chart** → "You can see Tuesday was a peak day. That's when the school run comes through."
- Scroll to **Today's Washes** log → "Every car, every tier, every rand — timestamped."

---

## Scene 2 — Staff Bay Board (2 min)

**URL**: `/staff` | **PIN**: `1234`

> *"Now flip to what your staff see on their tablet."*

- Show the bay cards: Active / Idle / Waiting
- Point to the queue counter: *"3 cars waiting — staff know what's next without asking you."*
- Tap a bay → *"One tap to start the next job. No paper tickets."*

---

## Scene 3 — Walk-In Check-In (1 min)

**URL**: `/checkin`

> *"Customer drives in. Staff scan or tap check-in."*

- Enter a car plate + select a tier → Submit
- *"The owner dashboard just updated in real time — no refresh, no call."*

---

## Scene 4 — Customer Booking (2 min)

**URL**: `/` (customer landing)

> *"And this is what your customers see if you share the link — or put a QR code at the gate."*

- Show the hero + wash tier cards
- Tap **Book a Wash** → walk through the 4-step flow (tier → date → time → details)
- *"They book on their phone, you get the job in the queue before they even arrive."*

---

## Closing

> *"This isn't a spreadsheet or a WhatsApp group. It's your business, tracked in real time.  
> You told me Bay 2 is always losing time. Now you can prove it — and fix it."*

**Next step**: Agree on a 2-week pilot. We configure it for your bays, your tiers, your pricing.

---

## Backup / Troubleshooting

| Problem | Fix |
|---|---|
| Dashboard shows 0 data | Hit `/api/seed` again |
| PIN rejected | Owner `0000`, Staff `1234` |
| Page won't load | Check Vercel status; have mobile hotspot ready |
| Real-time not updating | Hard refresh; Supabase Realtime occasionally drops on free tier |
