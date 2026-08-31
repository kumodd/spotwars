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
        // SpotWars design system
        bg: {
          DEFAULT: "#0A0A0F",
          surface: "#13131A",
          elevated: "#1A1A24",
          border: "#1E1E2E",
        },
        accent: {
          purple: "#7C3AED",
          "purple-light": "#9D5FFF",
          "purple-dim": "#7C3AED33",
          red: "#EF4444",
          "red-dim": "#EF444422",
          emerald: "#10B981",
          "emerald-dim": "#10B98122",
          gold: "#F59E0B",
          "gold-dim": "#F59E0B22",
          blue: "#3B82F6",
          "blue-dim": "#3B82F622",
        },
        rank: {
          gold: "#F59E0B",
          silver: "#94A3B8",
          bronze: "#CD7F32",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
      },
      animation: {
        "rank-up": "rankUp 0.6s ease-out",
        "rank-down": "rankDown 0.6s ease-out",
        "pulse-red": "pulseRed 2s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "slide-in-up": "slideInUp 0.4s ease-out",
        "count-up": "countUp 0.8s ease-out",
        "glow-purple": "glowPurple 3s ease-in-out infinite",
        ticker: "ticker 30s linear infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        rankUp: {
          "0%": { backgroundColor: "#10B98133", transform: "translateY(-4px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        rankDown: {
          "0%": { backgroundColor: "#EF444433", transform: "translateY(4px)" },
          "100%": { backgroundColor: "transparent", transform: "translateY(0)" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 #EF444444" },
          "50%": { boxShadow: "0 0 0 8px #EF444400" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPurple: {
          "0%, 100%": { boxShadow: "0 0 20px #7C3AED44" },
          "50%": { boxShadow: "0 0 40px #7C3AED88" },
        },
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "purple-glow":
          "radial-gradient(ellipse at top, #7C3AED22 0%, transparent 70%)",
        "grid-pattern": "linear-gradient(#1E1E2E 1px, transparent 1px), linear-gradient(90deg, #1E1E2E 1px, transparent 1px)",
        shimmer: "linear-gradient(90deg, transparent 0%, #ffffff0a 50%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
