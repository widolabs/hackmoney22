import { Biconomy } from "@biconomy/mexa";

import config from "../../config";

export class BiconomyImpl {
  constructor() {
    // TODO: Check for environment and set it appropriately.
    this.isReady = false;
    this.biconomy = undefined;
  }

  ensure() {
    if (!this.isReady) {
      throw new Error("Biconomy is not ready.");
    }
  }

  async create(network, provider) {
    this.isReady = false;
    this.biconomy = undefined;

    if (config.BICONOMY_API_KEY[network]) {
      this.biconomy = new Biconomy(provider, {
        apiKey: config.BICONOMY_API_KEY[network],
        debug: config.DEBUG,
      });

      this.biconomy
        .onEvent(this.biconomy.READY, () => {
          this.isReady = true;
          console.log("Biconomy is ready");
        })
        .onEvent(this.biconomy.ERROR, (error, message) => {
          // Handle error while initializing mexa
          console.log(
            "📜 LOG > BiconomyImpl > .onEvent > error, message",
            error,
            message
          );
        });
    }
    return !!this.biconomy;
  }
}
