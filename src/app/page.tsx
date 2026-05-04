"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Phone, User, ChevronLeft, Check, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { WashTierCard } from "@/components/shared/wash-tier-card";
import { supabase } from "@/lib/supabase";
import { cn, isValidSAPhone, formatZAR } from "@/lib/utils";
import { format, addDays } from "date-fns";
import type { WashTier } from "@/lib/database.types";

type BookingStep = "landing" | "tier" | "date" | "time" | "details" | "confirm";

interface TimeSlot {
  time: string;
  available: boolean;
  remaining: number;
}

export default function CustomerPage() {
  const [tiers, setTiers] = useState<WashTier[]>([]);
  const [step, setStep] = useState<BookingStep>("landing");
  const [selectedTier, setSelectedTier] = useState<WashTier | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("wash_tiers")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setTiers(data);
      });
  }, []);

  // Fetch availability when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    fetch(`/api/bookings/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => toast.error("Failed to load availability"))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      value: format(d, "yyyy-MM-dd"),
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(d, "EEE"),
      date: format(d, "d MMM"),
    };
  });

  const handleStartBooking = (tier?: WashTier) => {
    if (tier) setSelectedTier(tier);
    setStep("tier");
  };

  const handleTierSelect = (tier: WashTier) => {
    setSelectedTier(tier);
    setStep("date");
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setStep("time");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep("details");
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    else if (!isValidSAPhone(phone)) newErrors.phone = "Enter a valid SA phone number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBooking = async () => {
    if (!validateDetails()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          wash_tier_id: selectedTier!.id,
          date: selectedDate,
          time_slot: selectedTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookingId(data.booking?.id ?? "");
      setBookingConfirmed(true);
      setStep("confirm");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const stepOrder: BookingStep[] = ["landing", "tier", "date", "time", "details"];
    const currentIndex = stepOrder.indexOf(step);
    if (currentIndex > 0) setStep(stepOrder[currentIndex - 1]);
  };

  const resetBooking = () => {
    setStep("landing");
    setSelectedTier(null);
    setSelectedDate("");
    setSelectedTime("");
    setName("");
    setPhone("");
    setBookingConfirmed(false);
    setBookingId("");
    setErrors({});
  };

  // Confirmation screen
  if (step === "confirm" && bookingConfirmed) {
    const dateObj = dates.find((d) => d.value === selectedDate);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-status-idle/10 flex items-center justify-center mb-8 animate-scale-check">
          <Check className="w-10 h-10 text-status-idle" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mb-2 animate-fade-up">
          Booking Confirmed
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {selectedTier?.name} Wash on {dateObj?.date} at {selectedTime}
        </p>
        {bookingId && (
          <p className="text-xs font-mono text-muted-foreground/60 tracking-widest mt-1.5 mb-8">
            Ref #{bookingId.slice(0, 8).toUpperCase()}
          </p>
        )}
        <div className="w-full max-w-sm rounded-xl glass-card p-5 text-left space-y-3 mt-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Wash</span>
            <span className="font-medium">{selectedTier?.name}</span>
          </div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">{selectedTier && formatZAR(selectedTier.price_zar)}</span>
          </div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{dateObj?.date}</span>
          </div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="h-px bg-border/50" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{name}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          See you at Cream Car Wash, Fourways!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <a
            href="/checkin"
            className="h-14 px-6 rounded-xl glossy-btn text-accent-foreground font-semibold flex items-center justify-center gap-2 text-base"
          >
            Check In on Arrival
          </a>
          <button
            onClick={resetBooking}
            className="h-12 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-muted/50 transition-colors duration-250"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Landing page
  if (step === "landing") {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Hero */}
        <section className="px-6 pt-16 pb-12 text-center relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
          {/* Animated glow blobs */}
          <div className="absolute top-[-40px] left-1/2 w-[450px] h-[350px] rounded-full bg-accent/[0.05] blur-[100px] pointer-events-none animate-drift-1" aria-hidden="true" />
          <div className="absolute top-[60px] left-[15%] w-[200px] h-[200px] rounded-full bg-gold-400/[0.06] blur-[80px] pointer-events-none animate-drift-2" aria-hidden="true" />
          <div className="absolute top-[40px] right-[10%] w-[150px] h-[150px] rounded-full bg-cream-300/[0.15] blur-[60px] pointer-events-none animate-drift-3" aria-hidden="true" />
          <div className="absolute bottom-[-20px] left-1/3 w-[250px] h-[200px] rounded-full bg-gold-500/[0.03] blur-[90px] pointer-events-none animate-drift-2 [animation-delay:-6s]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-cream-200/20 via-transparent to-cream-100/10 pointer-events-none animate-gradient-breathe" aria-hidden="true" />
          <div className="absolute inset-0 bg-grain pointer-events-none" aria-hidden="true" />

          <div className="flex items-center justify-center gap-2 mb-5 animate-fade-up">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent tracking-widest uppercase">
              Cream Car Wash
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-foreground leading-[1.08] tracking-tight mb-5 animate-fade-up-1 [text-wrap:balance]">
            Premium Car Wash,<br />Fourways
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed animate-fade-up-2">
            Book your wash online or walk in.<br />Your car deserves the best.
          </p>
          <div className="animate-fade-up-3">
            <button
              onClick={() => handleStartBooking()}
              className="h-14 px-10 rounded-xl glossy-btn text-accent-foreground font-semibold text-base inline-flex items-center gap-2.5 animate-glow-pulse"
            >
              Book a Wash
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground/70 tracking-wide animate-fade-up-4">
            No account needed <span className="mx-2 text-border">|</span> Book in 2 minutes
          </p>
        </section>

        {/* Tier cards */}
        <section className="px-6 pb-16 relative">
          <div className="section-divider" />
          <h2 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-2 text-center pt-8">
            Our Wash Packages
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-accent/10 via-accent/50 to-accent/10 mx-auto mb-8 rounded-full" />
          <div className="max-w-md mx-auto space-y-4 md:max-w-2xl md:grid md:grid-cols-2 md:gap-5 md:space-y-0">
            {tiers.map((tier, i) => (
              <div key={tier.id} className={["animate-fade-up", "animate-fade-up-1", "animate-fade-up-2"][i] || "animate-fade-up-2"}>
                <WashTierCard
                  tier={tier}
                  mostPopular={tier.sort_order === 2}
                  isPremium={tier.sort_order === 3}
                  onSelect={() => handleStartBooking(tier)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 text-center text-sm text-muted-foreground">
          <div className="section-divider mb-10" />
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent/50" />
            <span className="font-display font-semibold text-foreground/80 tracking-widest text-xs uppercase">
              Cream Car Wash
            </span>
          </div>
          <p className="leading-relaxed">Fourways, Gauteng</p>
          <p className="mt-1 leading-relaxed">Open 7 days, 07:00 – 17:30</p>
        </footer>
      </div>
    );
  }

  // Booking flow steps
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Booking header */}
      <header className="sticky top-0 z-40 glass-surface border-b border-white/30 px-4 py-3.5">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted transition-colors duration-200"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Book a Wash</p>
            <p className="font-display font-semibold text-foreground text-sm tracking-tight">
              {step === "tier" ? "1 — Choose Wash" : step === "date" ? "2 — Pick a Date" : step === "time" ? "3 — Select a Time" : "4 — Your Details"}
            </p>
          </div>
        </div>
      </header>

      {/* Step progress */}
      <div className="max-w-md mx-auto px-6 pt-5 pb-2">
        <div className="flex gap-1.5">
          {["tier", "date", "time", "details"].map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-400 ease-in-out",
                ["tier", "date", "time", "details"].indexOf(step) >= i
                  ? "bg-accent"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 py-8">
        {/* Step: Tier */}
        {step === "tier" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground tracking-tight mb-5">
              Choose your wash
            </h2>
            <div className="space-y-4">
              {tiers.map((tier) => (
                <WashTierCard
                  key={tier.id}
                  tier={tier}
                  selected={selectedTier?.id === tier.id}
                  mostPopular={tier.sort_order === 2}
                  isPremium={tier.sort_order === 3}
                  onSelect={handleTierSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground tracking-tight mb-5">
              Pick a date
            </h2>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-7">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDateSelect(d.value)}
                  className={cn(
                    "rounded-xl border p-3.5 text-center transition-all duration-250 ease-in-out",
                    selectedDate === d.value
                      ? "border-accent/40 bg-accent/5 shadow-card-sm"
                      : "border-border hover:border-accent/20 hover:shadow-card-sm hover:-translate-y-0.5"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.date}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground tracking-tight mb-1.5">
              Select a time
            </h2>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                {dates.find((d) => d.value === selectedDate)?.date}
              </p>
              {selectedTier && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/8 px-3 py-1.5 rounded-full">
                  {selectedTier.name} · {formatZAR(selectedTier.price_zar)}
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      "h-12 rounded-xl border text-sm font-medium transition-all duration-250 ease-in-out",
                      !slot.available && "opacity-30 cursor-not-allowed bg-muted",
                      slot.available && selectedTime === slot.time
                        ? "border-accent/40 bg-accent/5 text-accent shadow-card-sm"
                        : slot.available
                        ? "border-border text-foreground hover:border-accent/20 hover:-translate-y-0.5 hover:shadow-card-sm"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground tracking-tight mb-5">
              Your details
            </h2>
            <div className="space-y-5">
              {/* Summary — shown first so price/tier is visible before committing */}
              <div className="rounded-xl glass-card border-accent/15 bg-gradient-to-br from-cream-50/60 to-[var(--glass-bg)] p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wash</span>
                  <span className="font-medium">{selectedTier?.name}</span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-semibold text-accent">{selectedTier && formatZAR(selectedTier.price_zar)}</span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {dates.find((d) => d.value === selectedDate)?.date}
                  </span>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="Your name"
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-xl border border-white/40 bg-[var(--glass-bg)] backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-250",
                      errors.name && "border-destructive"
                    )}
                  />
                </div>
                {errors.name && <p className="text-destructive text-xs mt-1.5">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="082 123 4567"
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-xl border border-white/40 bg-[var(--glass-bg)] backdrop-blur-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-all duration-250",
                      errors.phone && "border-destructive"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs mt-1.5">{errors.phone}</p>}
              </div>

              <button
                onClick={handleSubmitBooking}
                disabled={loading}
                className="w-full h-14 rounded-xl glossy-btn text-accent-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
