import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          950: "#2B0A12",
          900: "#3A0F17",
          800: "#4A1620",
          700: "#5C1D29",
        },
        gold: {
          500: "#D4A64A",
          400: "#E3BE6E",
          300: "#F0D89A",
        },
        sindoor: {
          600: "#A8331F",
          500: "#C1442E",
          400: "#D65A3F",
        },
        cream: {
          100: "#F6ECDA",
          200: "#EFE0C4",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-work-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
