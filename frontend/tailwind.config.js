/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // From Dashboard
        'primary': "#3A5AFF",
        'primary-foreground': "#ffffff",
        'secondary': "#EEF2FF",
        'secondary-foreground': "#3A5AFF",
        'background': "#F9FAFB",
        'foreground': "#111827",
        'card': "#FFFFFF",
        'card-foreground': "#111827",
        'muted': "#F3F4F6",
        'muted-foreground': "#6B7280",
        'border': "#E5E7EB",
        'ring': "#A4BCFF",
        'success': "#10B981",
        'success-foreground': "#ffffff",
        
        // From Login Page
        'login-primary': '#123a97',
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
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
