import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        cream: {
          50: "#FFFBF5",
          100: "#FFF5E6",
          200: "#FFEACC",
          300: "#FFE0B2",
        },
        gold: {
          400: "#D4A030",
          500: "#B8860B",
          600: "#996515",
        },
        status: {
          idle: "#059669",
          active: "#2563EB",
          waiting: "#D97706",
        },
      },
      letterSpacing: {
        tightest: "-0.04em", // net-new; do not add tight/tighter/etc (would override Tailwind defaults)
      },
      fontSize: {
        kpi: ["3rem", { lineHeight: "1.1", fontWeight: "600" }],
        "kpi-label": ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      boxShadow: {
        "card-sm": "0 1px 2px rgba(28, 25, 23, 0.05)",
        "card-md": "0 2px 8px rgba(28, 25, 23, 0.08)",
        "card-lg": "0 4px 16px rgba(28, 25, 23, 0.12)",
        "card-hover": "0 6px 20px rgba(28, 25, 23, 0.10)",
        "card-active": "0 2px 4px rgba(28, 25, 23, 0.06)",
        "card-glass":
          "0 2px 12px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        "card-glass-hover":
          "0 8px 30px rgba(28, 25, 23, 0.10), 0 2px 4px rgba(28, 25, 23, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
        "pin-key":
          "0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.5)",
        "pin-key-active": "inset 0 2px 4px rgba(28, 25, 23, 0.1)",
        "btn-glow":
          "0 0 0 3px rgba(180, 100, 20, 0.12), 0 4px 12px rgba(180, 100, 20, 0.18)",
        "btn-premium":
          "inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 2px 8px rgba(180, 100, 20, 0.25), 0 0 0 1px rgba(180, 100, 20, 0.1)",
        "glow-accent":
          "0 0 20px rgba(180, 100, 20, 0.15), 0 0 40px rgba(180, 100, 20, 0.05)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-check": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "60%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(180, 100, 20, 0)" },
          "50%": { boxShadow: "0 0 0 8px rgba(180, 100, 20, 0.06)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "drift-1": {
          "0%": { transform: "translate(-50%, 0) scale(1)" },
          "25%": { transform: "translate(-45%, -8px) scale(1.05)" },
          "50%": { transform: "translate(-55%, 4px) scale(0.95)" },
          "75%": { transform: "translate(-48%, -4px) scale(1.02)" },
          "100%": { transform: "translate(-50%, 0) scale(1)" },
        },
        "drift-2": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(12px, -10px) scale(1.08)" },
          "66%": { transform: "translate(-8px, 6px) scale(0.94)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "drift-3": {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "30%": { transform: "translate(-10px, 8px) scale(1.06)" },
          "60%": { transform: "translate(8px, -6px) scale(0.96)" },
          "100%": { transform: "translate(0, 0) scale(1)" },
        },
        "gradient-breathe": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "skeleton-shine": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-up-1": "fade-up 0.4s ease-out 0.08s both",
        "fade-up-2": "fade-up 0.4s ease-out 0.16s both",
        "fade-up-3": "fade-up 0.4s ease-out 0.24s both",
        "fade-up-4": "fade-up 0.4s ease-out 0.32s both",
        "scale-check": "scale-check 0.5s ease-out both",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "drift-1": "drift-1 12s ease-in-out infinite",
        "drift-2": "drift-2 16s ease-in-out infinite",
        "drift-3": "drift-3 14s ease-in-out infinite",
        "gradient-breathe": "gradient-breathe 8s ease-in-out infinite",
        "skeleton-shine": "skeleton-shine 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
