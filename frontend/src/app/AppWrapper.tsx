import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Stack } from "@mui/material";

import { AnalyticsContext } from "../hooks/useAnalytics";
import { initApp, newPageVisited } from "../state/reducers/appSlice";
import VaultDetailPage from "../pages/vault-detail/VaultDetailPage";
import VaultsListPage from "../pages/vault-list/VaultsListPage";

import { SidePanel } from "./SidePanel";
import { ErrorBoundary } from "@sentry/react";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { RouteFallback } from "../components/RouteFallback";
import { Analytics } from "@segment/analytics-next";
import AnalyticsService from "../frameworks/segment/AnalyticsService";
import { useAppSelector } from "../state/store";
import { StablecoinCollateralizationPage } from "../pages/StablecoinCollateralizationPage";
import { PhuturePage } from "../pages/phuture/PhuturePage";
import { TopPanel } from "./TopPanel";
import { RouterPage } from "../pages/router/RouterPage";

function AppWrapper() {
  const location = useLocation();
  const [analytics, setAnalytics] = useState<Analytics | undefined>();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initApp());
  }, [dispatch]);

  useEffect(() => {
    const loadAnalytics = async () => {
      const analytics = await AnalyticsService.get();
      setAnalytics(analytics);
    };
    loadAnalytics();
  }, []);

  useEffect(() => {
    analytics?.page();
    // dedup first page load being tracked twice
    if (analytics) {
      dispatch(newPageVisited(location.pathname));
    }
  }, [analytics, location.pathname, dispatch]);

  const isAppInitialized = useAppSelector(
    (state) => state.app.isAppInitialized
  );

  if (!isAppInitialized) {
    return <LoadingIndicator />;
  }

  const showTopPanel = ["/phuture", "/router"].includes(location.pathname);

  return (
    <AnalyticsContext.Provider value={analytics}>
      <Stack direction={showTopPanel ? "column" : "row"}>
        {showTopPanel ? <TopPanel /> : <SidePanel />}
        <Routes>
          <Route
            path="/"
            element={
              // We must set a key prop so that react does not reuse the ErrorBoundary component
              // and its state: https://stackoverflow.com/a/59057428
              <ErrorBoundary
                key="list"
                fallback={<RouteFallback message="Loading this page failed." />}
              >
                <VaultsListPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/vault/:vaultAddress/:chainId"
            element={
              <ErrorBoundary
                key="detail"
                fallback={<RouteFallback message="Loading this page failed." />}
              >
                <VaultDetailPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/stablecoin-collateralization"
            element={
              <ErrorBoundary
                key="sc"
                fallback={<RouteFallback message="Loading this page failed." />}
              >
                <StablecoinCollateralizationPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/phuture"
            element={
              <ErrorBoundary
                key="phuture"
                fallback={<RouteFallback message="Loading this page failed." />}
              >
                <PhuturePage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/router"
            element={
              <ErrorBoundary
                key="router"
                fallback={<RouteFallback message="Loading this page failed." />}
              >
                <RouterPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="*"
            element={<RouteFallback message="Page not found." />}
          />
        </Routes>
      </Stack>
    </AnalyticsContext.Provider>
  );
}

export default AppWrapper;
