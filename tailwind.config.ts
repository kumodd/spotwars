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
        // InternetBillboard.space paper design system
        bg: {
          DEFAULT: "#FDFBF7", // warm ivory paper
          surface: "#F4F1EA",
          elevated: "#EBE6DC",
          border: "#D1CCC2",
        },
        ink: {
          DEFAULT: "#111111", // near-black ink
          light: "#222222",
          lighter: "#444444",
          muted: "#5A5A5A",
        },
        accent: {
          DEFAULT: "#111111",  // primary is ink, not orange
          hover: "#333333",
          // Semantic competition colors
          green: "#059669",    // muted green for up movement
          "green-dim": "#05966915",
          red: "#DC2626",      // muted red for down movement / live dot
          "red-dim": "#DC262615",
          gold: "#B45309",     // rank #1 gold
          "gold-dim": "#B4530915",
        },
        rank: {
          gold: "#B45309",
          silver: "#475569",
          bronze: "#78350F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["'JetBrains Mono'", "'Fira Code'", "ui-monospace", "monospace"],
      },
      animation: {
        "rank-up": "rankUp 0.6s ease-out",
        "rank-down": "rankDown 0.6s ease-out",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "slide-in-up": "slideInUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        shimmer: "shimmer 1.5s linear infinite",
        "entry": "entrySlide 0.3s ease-out",
      },
      keyframes: {
        rankUp: {
          "0%": { backgroundColor: "#05966920", transform: "translateY(-1px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        rankDown: {
          "0%": { backgroundColor: "#DC262620", transform: "translateY(1px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(6px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
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
        entrySlide: {
          "0%": { opacity: "0", transform: "translateY(-4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
