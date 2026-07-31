import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    sentryVitePlugin({
      org: "leanware",
      project: "prd-agent-frontend",
    }),
  ],
});
