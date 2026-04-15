import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1e3a5f",
        emerald: "#10b981",
        gold: "#f59e0b",
        btc: "#f97316",
        purple: "#7c3aed",
        crimson: "#dc2626",
        steel: "#64748b",
        ice: "#0ea5e9",
      },
    },
  },
  plugins: [],
} satisfies Config;
