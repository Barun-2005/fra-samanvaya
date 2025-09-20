import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
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
              };
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .form-input {
                transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
              }
              .form-input:focus {
                border-color: #123a97;
                box-shadow: 0 0 0 3px rgba(18, 58, 151, 0.2);
                outline: none;
              }
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
