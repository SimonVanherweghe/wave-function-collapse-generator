import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/wave-function-collapse-generator",
  test: {
    globals: true,
    environment: "jsdom",
    css: false,
    setupFiles: "./src/setupTests.js",
  },
});
