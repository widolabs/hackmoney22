import { createContext, useContext } from "react";
import { Analytics } from "@segment/analytics-next";

export const AnalyticsContext = createContext<Analytics | undefined>(undefined);

export const useAnalytics = () => {
  return useContext(AnalyticsContext);
};
