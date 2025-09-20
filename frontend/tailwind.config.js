/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#123a97",
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
        "foreground-light": "#0e121b",
        "foreground-dark": "#f6f6f8",
        "input-light": "#ffffff",
        "input-dark": "#1a2233",
        "border-light": "#d0d7e6",
        "border-dark": "#2c3a54",
        "placeholder-light": "#4f6596",
        "placeholder-dark": "#9ab3d5",
        "accent-success-light": "#059669",
        "accent-success-dark": "#34d399",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
