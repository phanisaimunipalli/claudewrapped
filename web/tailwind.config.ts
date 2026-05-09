import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        claude: {
          bg: "#0D0D0D",
          card: "#141414",
          border: "#262626",
          accent: "#D4A574",
          orange: "#E8834E",
          muted: "#6B7280",
          text: "#F5F5F5",
        },
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "count-up": "countUp 1s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
