"use client";

import { useState, useEffect } from "react";
import { Check, User, Phone, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { WashTierCard } from "@/components/shared/wash-tier-card";
import { supabase } from "@/lib/supabase";
import { cn, isValidSAPhone, formatDuration } from "@/lib/utils";
import type { WashTier } from "@/lib/database.types";

type Step = "tier" | "details" | "confirm";

export default function CheckInPage() {
  const [tiers, setTiers] = useState<WashTier[]>([]);
  const [step, setStep] = useState<Step>("tier");
  const [selectedTier, setSelectedTier] = useState<WashTier | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [queuePosition, setQueuePosition] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    supabase
      .from("wash_tiers")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setTiers(data);
      });
  }, []);

  const handleTierSelect = (tier: WashTier) => {
    setSelectedTier(tier);
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

  const handleCheckIn = async () => {
    if (!validateDetails() || !selectedTier) return;
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          wash_tier_id: selectedTier.id,
          source: "walk_in",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQueuePosition(data.job.queue_position);
      setEstimatedWait(data.job.estimated_wait_minutes);
      setStep("confirm");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Confirmation
  if (step === "confirm") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-status-idle/10 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-status-idle" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          You are checked in
        </h1>
        <p className="text-muted-foreground mb-6">
          {selectedTier?.name} Wash for {name}
        </p>

        <div className="w-full max-w-sm space-y-4 mb-8">
          <div className="rounded-xl border bg-card p-6 shadow-card-sm text-center">
            <p className="text-kpi-label text-muted-foreground mb-1">
              Your position
            </p>
            <p className="text-kpi tabular-nums text-accent">#{queuePosition}</p>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-card-sm text-center">
            <p className="text-kpi-label text-muted-foreground mb-1">
              Estimated wait
            </p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              ~{formatDuration(estimatedWait)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Please wait in the area. We will call your name.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-accent tracking-wide uppercase">
            Cream Car Wash
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Walk-In Check-In
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === "tier" ? "Select your wash package" : "Enter your details"}
        </p>
      </header>

      <main className="max-w-md mx-auto px-6 pb-8">
        {/* Step: Tier */}
        {step === "tier" && (
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
        )}

        {/* Step: Details */}
        {step === "details" && (
          <div className="space-y-4">
            <button
              onClick={() => setStep("tier")}
              className="text-sm text-accent font-medium mb-2"
            >
              Change wash: {selectedTier?.name}
            </button>

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

            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="w-full h-12 rounded-lg bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking in...
                </>
              ) : (
                "Check In"
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
