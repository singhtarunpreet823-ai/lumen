import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-soft": "rgb(var(--primary-soft) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        income: "rgb(var(--income) / <alpha-value>)",
        expense: "rgb(var(--expense) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        glass: "0 8px 40px -12px rgba(0, 0, 0, 0.35)",
        "glow-primary": "0 0 60px -12px rgb(var(--primary) / 0.45)",
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--primary) / 0.4)" },
          "70%": { boxShadow: "0 0 0 14px rgb(var(--primary) / 0)" },
          "100%": { boxShadow: "0 0 0 0 rgb(var(--primary) / 0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;