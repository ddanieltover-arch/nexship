import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0f172a", // Fallback
          50: "#f8fafc",
          900: "#020617",
        },
        teal: {
          DEFAULT: "#06b6d4",
          600: "#0891b2",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
