/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./store/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./App.{js,ts,jsx,tsx}",
    "./main.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "Playfair Display",
          "ui-serif",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "Times",
          "serif",
        ],
      },
      screens: {
        mobile: "375px",
        "mobile-lg": "430px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
        "safe-left": "env(safe-area-inset-left)",
        "safe-right": "env(safe-area-inset-right)",
      },
      minHeight: {
        touch: "44px",
        dvh: "100dvh",
        "screen-safe":
          "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      },
      minWidth: {
        touch: "44px",
      },
      height: {
        dvh: "100dvh",
        touch: "44px",
        screen: "100vh",
        "screen-dvh": "100dvh",
        "screen-safe":
          "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        "container-full": "calc(100dvh - env(safe-area-inset-top))",
        "content-area":
          "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)",
      },
      maxWidth: {
        mobile: "375px",
        "mobile-lg": "430px",
        "mobile-full": "100vw",
      },
      maxHeight: {
        "screen-safe":
          "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        "container-full": "calc(100dvh - env(safe-area-inset-top))",
        "content-area":
          "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 4rem)",
      },
      colors: {
        amber: {
          50: "#fff8f0",
          100: "#feefe6",
          200: "#fcdccf",
          300: "#f9bfaa",
          400: "#f59c7d",
          500: "#f07a54",
          600: "#e25a3a",
          700: "#b9472c",
          800: "#923924",
          900: "#772f1e",
        },
      },
    },
  },
  plugins: [],
};
