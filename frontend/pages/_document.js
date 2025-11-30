import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: "class",
                theme: {
                  extend: {
                    colors: {
                      // Dashboard Theme
                      "primary": "#3A5AFF",
                      "primary-foreground": "#ffffff",
                      "secondary": "#EEF2FF",
                      "secondary-foreground": "#3A5AFF",
                      "background": "#F9FAFB",
                      "foreground": "#111827",
                      "card": "#FFFFFF",
                      "card-foreground": "#111827",
                      "muted": "#F3F4F6",
                      "muted-foreground": "#6B7280",
                      "border": "#E5E7EB",
                      "ring": "#A4BCFF",
                      "success": "#10B981",
                      "success-foreground": "#ffffff",
                      
                      // Login Page Theme
                      'login-primary': '#123a97',
                      "background-light": "#f6f6f8",
                      "foreground-light": "#0e121b",
                      "input-light": "#ffffff",
                      "border-light": "#d0d7e6",
                      "placeholder-light": "#4f6596",
                    },
                    fontFamily: {
                      display: ["Inter", "sans-serif"],
                    },
                    borderRadius: {
                      DEFAULT: "0.5rem",
                      lg: "0.75rem",
                      xl: "1rem",
                      "2xl": "1.5rem",
                      full: "9999px"
                    },
                    boxShadow: {
                      'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
                    }
                  },
                },
              };
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
