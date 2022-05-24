import { Analytics, AnalyticsBrowser } from "@segment/analytics-next";
import CONFIG from "../../config";

class AnalyticsService {
  private instancePromised: Promise<Analytics>;

  constructor() {
    this.instancePromised = AnalyticsBrowser.load({
      writeKey: CONFIG.SEGMENT_KEY,
    }).then((response) => response[0]);
  }

  get = () => this.instancePromised;
}
export default new AnalyticsService();
