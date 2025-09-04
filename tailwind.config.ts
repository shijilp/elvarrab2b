// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem", // 16px
          sm: "1.5rem",    // 24px
          lg: "2rem",      // 32px
          xl: "3rem",      // 48px
        },
      },
    },
  },
  plugins: [],
};

export default config;
