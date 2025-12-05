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
        // Gold Standard Colors from stitch_html/citizen_dashboard_1/code.html
        primary: {
          DEFAULT: '#4338ca', // indigo-700
          hover: '#3730a3', // indigo-800
          focus: '#4f46e5' // indigo-600
        },
        "background-light": "#f8fafc", // slate-50
        "background-dark": "#0f172a", // slate-900
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b", // slate-800
        "text-light-primary": "#0f172a", // slate-900
        "text-dark-primary": "#f8fafc", // slate-50
        "text-light-secondary": "#64748b", // slate-500
        "text-dark-secondary": "#94a3b8", // slate-400
        "border-light": "#e2e8f0", // slate-200
        "border-dark": "#334155", // slate-700

        // Legacy/Other colors (keeping for compatibility but overriding main ones)
        'secondary': "#EEF2FF",
        'secondary-foreground': "#3A5AFF",
        'foreground': "#111827",
        'card': "#FFFFFF",
        'card-foreground': "#111827",
        'muted': "#F3F4F6",
        'muted-foreground': "#6B7280",
        'border': "#E5E7EB",
        'ring': "#A4BCFF",
        'success': "#10B981",
        'success-foreground': "#ffffff",
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
    require('@tailwindcss/typography'),
  ],
}
