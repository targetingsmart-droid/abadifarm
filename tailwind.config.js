/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E5C3E",
          50: "#F0F7F2",
          100: "#D4E8DA",
          200: "#A8D1B4",
          300: "#7DBA8F",
          400: "#51A369",
          500: "#2E5C3E",
          600: "#254A32",
          700: "#1C3825",
          800: "#132619",
          900: "#0A140C",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#E9C46A",
          50: "#FDF8EB",
          100: "#F9EDCC",
          200: "#F3DB99",
          300: "#EEC966",
          400: "#E9C46A",
          500: "#D4A843",
          600: "#B8892A",
          700: "#8C6920",
          800: "#604916",
          900: "#34280C",
          foreground: "hsl(var(--secondary-foreground))",
        },
        background: "#F9F9F6",
        surface: "#FFFFFF",
        "text-primary": "#2C3E2D",
        "text-secondary": "#5B6C5D",
        accent: {
          DEFAULT: "#D4583A",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        card: "0 4px 6px -1px rgba(46, 92, 62, 0.1), 0 2px 4px -2px rgba(46, 92, 62, 0.1)",
        "card-hover":
          "0 20px 25px -5px rgba(46, 92, 62, 0.15), 0 8px 10px -6px rgba(46, 92, 62, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
