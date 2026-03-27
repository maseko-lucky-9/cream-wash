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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-background">
      <h1 className="text-2xl font-display font-semibold text-foreground mb-8">
        {title}
      </h1>

      {/* PIN dots */}
      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-200",
              i < pin.length
                ? "bg-accent border-accent scale-110"
                : "border-muted-foreground/40"
            )}
          />
        ))}
      </div>

      {/* PIN display (monospace) */}
      <div className="font-mono text-3xl tracking-[0.5em] text-foreground mb-2 h-10 flex items-center">
        {pin.split("").map((_, i) => (
          <span key={i}>*</span>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-destructive text-sm font-medium mb-4 animate-in fade-in">
          {error}
        </p>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Verifying...</span>
        </div>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
        {digits.map((d, i) => {
          if (d === "") return <div key={i} />;
          if (d === "del") {
            return (
              <button
                key={i}
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-[56px] rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-30"
                aria-label="Delete"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleDigit(d)}
              disabled={loading || pin.length >= 4}
              className="h-[56px] rounded-lg bg-card shadow-card-sm border border-border text-xl font-mono font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors disabled:opacity-50"
            >
              {d}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-8">
        Staff: 1234 or 5678 | Owner: 0000
      </p>
    </div>
  );
}
