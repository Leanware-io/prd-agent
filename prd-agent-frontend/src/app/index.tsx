import "@/app/styles/index.css";
import "@fontsource/inter";
import * as Sentry from "@sentry/react";
import App from "@/app/App";

import { createRoot } from "react-dom/client";

import { StrictMode } from "react";

Sentry.init({
  debug: false,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NEXT_ENV ?? "development",
  ignoreErrors: [/canceled/i],
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  tracesSampleRate: 0,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
