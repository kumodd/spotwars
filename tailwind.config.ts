import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SpotWars neutral design system — functional, editorial
        bg: {
          DEFAULT: "#0C0C0C",
          surface: "#111111",
          elevated: "#181818",
          border: "#242424",
        },
        // Functional accent — warm orange, competitive, not AI
        accent: {
          DEFAULT: "#E85D27",
          hover: "#D44E1E",
          dim: "#E85D2720",
          // Semantic competition colors
          green: "#22C55E",
          "green-dim": "#22C55E18",
          red: "#EF4444",
          "red-dim": "#EF444418",
          gold: "#D4A017",
          "gold-dim": "#D4A01718",
          blue: "#3B82F6",
          "blue-dim": "#3B82F618",
        },
        rank: {
          gold: "#D4A017",
          silver: "#94A3B8",
          bronze: "#A0674A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "monospace"],
      },
      animation: {
        "rank-up": "rankUp 0.5s ease-out",
        "rank-down": "rankDown 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        shimmer: "shimmer 1.5s linear infinite",
      },
      keyframes: {
        rankUp: {
          "0%": { backgroundColor: "#22C55E18", transform: "translateY(-2px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        rankDown: {
          "0%": { backgroundColor: "#EF444418", transform: "translateY(2px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
