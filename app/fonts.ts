import localFont from "next/font/local";

// Bundled Adobe Source Sans 3: no external font requests at build or runtime.
export const sourceSans3 = localFont({
  src: [
    {
      path: "./fonts/source-sans-3-upright.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "./fonts/source-sans-3-italic.woff2",
      weight: "200 900",
      style: "italic",
    },
  ],
  variable: "--font-source-sans-3",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});
