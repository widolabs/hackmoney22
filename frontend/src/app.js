import * as React from "react";
import ReactDOM from "react-dom";
import { Provider as ReactReduxProvider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import * as FullStory from "@fullstory/browser";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CssBaseline } from "@mui/material";
//
import store, { persistor } from "./state/store";
import WidoApp from "./app/AppWrapper";
import { WidoThemeProvider } from "./hooks/useWidoTheme";
import config from "./config";
import { PersistGate } from "redux-persist/integration/react";

if (process.env.NODE_ENV !== "development") {
  FullStory.init({ orgId: "13P4QC" });
}

Sentry.init({
  dsn: config.SENTRY.dsn,
  integrations: [new BrowserTracing()],
  environment: process.env.NODE_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: config.SENTRY.tracesSampleRate,
});

/**
 * https://github.com/getsentry/sentry-javascript/issues/3382
 */
document.body.addEventListener(
  "error",
  (event) => {
    if (!event.target) return;

    if (event.target.tagName === "IMG") {
      Sentry.captureMessage(
        `Failed to load image: ${event.target.src}`,
        Sentry.Severity.Warning
      );
    } else if (event.target.tagName === "LINK") {
      Sentry.captureMessage(
        `Failed to load css: ${event.target.href}`,
        Sentry.Severity.Warning
      );
    }
  },
  true
);

ReactDOM.render(
  <React.StrictMode>
    <ReactReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <WidoThemeProvider>
            <CssBaseline />
            <WidoApp />
          </WidoThemeProvider>
        </Router>
      </PersistGate>
    </ReactReduxProvider>
  </React.StrictMode>,
  document.getElementById("wido-app")
);
