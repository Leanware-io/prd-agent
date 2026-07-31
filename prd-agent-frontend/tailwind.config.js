import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class"],
  plugins: [require("tailwindcss-animate")],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        progress: "progress 2s infinite linear",
        pulse: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        recording: "recording 2s ease-in-out infinite",
      },
      borderRadius: {
        button: "32px",
        container: "12px",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        background: "hsl(var(--background))",
        border: "hsl(var(--border))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        input: "hsl(var(--input))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          500: "#4cd7ae",
          700: "#36997c",
          900: "#205a49",
          DEFAULT: "#4cd7ae",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          500: "#002832",
          700: "#001c24",
          900: "#001115",
          DEFAULT: "#002832",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        pulse: {
          "50%": {
            opacity: 0.25,
          },
        },
        recording: {
          "0%": { backgroundColor: "#4cd7ae", width: "0%" },
          "50%": { backgroundColor: "#4cd7ae", width: "100%" },
          "100%": { backgroundColor: "#4cd7ae", width: "0%" },
        },
      },
    },
  },
};
