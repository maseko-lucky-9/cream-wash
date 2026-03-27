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
    setErrors({});
  };

  // Confirmation screen
  if (step === "confirm" && bookingConfirmed) {
    const dateObj = dates.find((d) => d.value === selectedDate);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-status-idle/10 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-status-idle" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          Booking Confirmed
        </h1>
        <p className="text-muted-foreground mb-6">
          {selectedTier?.name} Wash on {dateObj?.date} at {selectedTime}
        </p>
        <div className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-card-sm text-left space-y-2 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Wash</span>
            <span className="font-medium">{selectedTier?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">{selectedTier && formatZAR(selectedTier.price_zar)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{dateObj?.date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{name}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          See you at Cream Car Wash, Fourways!
        </p>
        <button
          onClick={resetBooking}
          className="h-12 px-6 rounded-lg bg-primary text-primary-foreground font-medium"
        >
          Done
        </button>
      </div>
    );
  }

  // Landing page
  if (step === "landing") {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="px-6 pt-16 pb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium text-accent tracking-wide uppercase">
              Cream Car Wash
            </span>
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground leading-tight mb-4">
            Premium Car Wash,<br />Fourways
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Book your wash online or walk in. Your car deserves the best.
          </p>
          <button
            onClick={() => handleStartBooking()}
            className="h-12 px-8 rounded-lg bg-accent text-accent-foreground font-semibold inline-flex items-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all shadow-card-md"
          >
            Book a Wash
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>

        {/* Tier cards */}
        <section className="px-6 pb-12">
          <h2 className="text-xl font-display font-semibold text-foreground mb-4 text-center">
            Our Wash Packages
          </h2>
          <div className="max-w-md mx-auto space-y-3">
            {tiers.map((tier) => (
              <WashTierCard
                key={tier.id}
                tier={tier}
                onSelect={() => handleStartBooking(tier)}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 border-t text-center text-sm text-muted-foreground">
          <p>Cream Car Wash, Fourways, Gauteng</p>
          <p className="mt-1">Open 7 days, 07:00 - 17:30</p>
        </footer>
      </div>
    );
  }

  // Booking flow steps
  return (
    <div className="min-h-screen bg-background">
      {/* Booking header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm text-muted-foreground">Book a Wash</p>
            <p className="font-display font-semibold text-foreground text-sm">
              Step{" "}
              {step === "tier" ? "1" : step === "date" ? "2" : step === "time" ? "3" : "4"}{" "}
              of 4
            </p>
          </div>
        </div>
      </header>

      {/* Step progress */}
      <div className="max-w-md mx-auto px-6 pt-4 pb-2">
        <div className="flex gap-1">
          {["tier", "date", "time", "details"].map((s, i) => (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                ["tier", "date", "time", "details"].indexOf(step) >= i
                  ? "bg-accent"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 py-6">
        {/* Step: Tier */}
        {step === "tier" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Choose your wash
            </h2>
            <div className="space-y-3">
              {tiers.map((tier) => (
                <WashTierCard
                  key={tier.id}
                  tier={tier}
                  selected={selectedTier?.id === tier.id}
                  onSelect={handleTierSelect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step: Date */}
        {step === "date" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Pick a date
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handleDateSelect(d.value)}
                  className={cn(
                    "rounded-xl border p-3 text-center transition-all",
                    selectedDate === d.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{d.label}</p>
                  <p className="text-xs text-muted-foreground">{d.date}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Time */}
        {step === "time" && (
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-1">
              Select a time
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {dates.find((d) => d.value === selectedDate)?.date}
            </p>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={cn(
                      "h-12 rounded-lg border text-sm font-medium transition-all",
                      !slot.available && "opacity-30 cursor-not-allowed bg-muted",
                      slot.available && selectedTime === slot.time
                        ? "border-accent bg-accent/5 text-accent"
                        : slot.available
                        ? "border-border text-foreground hover:border-muted-foreground/30"
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
            <h2 className="text-xl font-display font-semibold text-foreground mb-4">
              Your details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="Your name"
                    className={cn(
                      "w-full h-12 pl-10 pr-4 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                      errors.name && "border-destructive"
                    )}
                  />
                </div>
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="082 123 4567"
                    className={cn(
                      "w-full h-12 pl-10 pr-4 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                      errors.phone && "border-destructive"
                    )}
                  />
                </div>
                {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* Summary */}
              <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wash</span>
                  <span className="font-medium">{selectedTier?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">{selectedTier && formatZAR(selectedTier.price_zar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">
                    {dates.find((d) => d.value === selectedDate)?.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </div>

              <button
                onClick={handleSubmitBooking}
                disabled={loading}
                className="w-full h-12 rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50"
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
