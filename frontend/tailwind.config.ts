import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  safelist: [
    "an-hidden",
    "an-dim",
    "an-spotlight",
    "an-reflow-center",
    "an-active",
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
