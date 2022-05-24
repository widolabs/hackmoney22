import { ethers } from "ethers";

import config from "../../config";

export const getContract = (address, abi, signer) => {
  return new ethers.Contract(address, abi, signer);
};

export const getEthersProvider = (provider) => {
  return new ethers.providers.Web3Provider(provider, "any");
};

export const getJsonRpcProvider = (url) => {
  return new ethers.providers.JsonRpcProvider({ url, timeout: 500000 });
};

export class EthersWeb3Provider {
  constructor() {
    this.instances = {};

    for (const [network, settings] of Object.entries(config.NETWORK_SETTINGS)) {
      const provider = getJsonRpcProvider(settings.rpcUrl);
      this.register(network, provider);
    }
  }

  register(type, instance) {
    this.instances[type] = instance;
  }

  getInstanceOf(type) {
    const instance = this.instances[type];

    if (!instance) {
      throw new Error(`No registered provider "${type}"`);
    }

    return instance;
  }

  getSigner() {
    const provider = this.getInstanceOf("wallet");
    return provider.getSigner();
  }
}
