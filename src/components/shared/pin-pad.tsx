"use client";

import { useState, useCallback } from "react";
import { Delete, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PinPadProps {
  onSubmit: (pin: string) => Promise<void>;
  title?: string;
  error?: string | null;
}

export function PinPad({ onSubmit, title = "Enter PIN", error }: PinPadProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (pin.length >= 4) return;
      const newPin = pin + digit;
      setPin(newPin);

      // Auto-submit on 4 digits
      if (newPin.length === 4) {
        setLoading(true);
        onSubmit(newPin).finally(() => {
          setLoading(false);
          setPin("");
        });
      }
    },
    [pin, onSubmit]
  );

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
  }, []);

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative bg-pin-surface">
      <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight mb-10">
        {title}
      </h1>

      {/* PIN dots */}
      <div className="flex gap-5 mb-8 animate-fade-up">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-3.5 h-3.5 rounded-full border-2 transition-all duration-250 ease-in-out",
              i < pin.length
                ? "bg-accent border-accent scale-110"
                : "border-muted-foreground/40"
            )}
          />
        ))}
      </div>

      {/* PIN display (monospace) */}
      <div className="font-mono text-3xl tracking-[0.5em] text-foreground mb-3 h-12 flex items-center glass-surface rounded-xl px-7 py-2 transition-all duration-250">
        {pin.split("").map((_, i) => (
          <span key={i}>*</span>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-destructive text-sm font-medium mb-5 animate-in fade-in">
          {error}
        </p>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground mb-5">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span className="text-sm">Verifying...</span>
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3.5 w-full max-w-[288px] mt-2">
        {digits.map((d, i) => {
          if (d === "") return <div key={i} />;
          if (d === "del") {
            return (
              <button
                key={i}
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                aria-label="Delete"
                className="h-[60px] rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 transition-colors duration-200 disabled:opacity-30"
              >
                <Delete className="w-6 h-6" aria-hidden="true" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              disabled={loading || pin.length >= 4}
              className="h-[60px] rounded-xl bg-gradient-to-b from-white to-cream-50 shadow-pin-key border border-white/60 text-xl font-mono font-medium text-foreground hover:from-cream-50 hover:to-cream-100 hover:-translate-y-0.5 hover:shadow-card-md active:shadow-pin-key-active active:from-cream-100 active:to-cream-200 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 transition-all duration-200 ease-in-out disabled:opacity-50"
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-10 opacity-70">
        Staff: 1234 or 5678 | Owner: 0000
      </p>
    </div>
  );
}
