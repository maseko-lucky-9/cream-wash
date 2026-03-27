import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format cents to ZAR display string: "R1,234" */
export function formatZAR(cents: number): string {
  const rands = Math.round(cents / 100);
  return `R${rands.toLocaleString("en-ZA")}`;
}

/** Format a duration in minutes to display string: "30 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Get elapsed time string from a start date */
export function getElapsedTime(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffSec = Math.floor((diffMs % 60000) / 1000);
  if (diffMin < 1) return `${diffSec}s`;
  return `${diffMin}m ${diffSec.toString().padStart(2, "0")}s`;
}

/** Validate SA phone number (basic) */
export function isValidSAPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, "");
  return /^(\+27|0)\d{9}$/.test(cleaned);
}

/** Generate time slots from 07:00 to 17:30 in 30-min increments */
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 7; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 17 || h === 17) {
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
  }
  return slots.filter((s) => s <= "17:30");
}
