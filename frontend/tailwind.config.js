/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "#4f46e5",
        background: "#090d16",
        foreground: "#f8fafc",
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#14b8a6",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1e293b",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#1e1b4b",
          foreground: "#a5b4fc",
        },
        card: {
          DEFAULT: "rgba(17, 24, 39, 0.7)",
          foreground: "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "16px",
        md: "12px",
        sm: "8px",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
