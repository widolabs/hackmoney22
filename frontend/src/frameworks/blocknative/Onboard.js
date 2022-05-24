import Onboard from "bnc-onboard";

import config from "../../config";

export class BlocknativeWallet {
  get isCreated() {
    return !!this.onboard;
  }

  create(subscriptions) {
    const wallets = [
      { walletName: "coinbase", preferred: true },
      { walletName: "metamask", preferred: true },
      { walletName: "frame" },
      {
        walletName: "walletConnect",
        rpc: {
          1: "https://mainnet.infura.io/v3/2247229f0cd74ed2bf1fe48c3d5430ef",
          250: "https://nd-520-334-586.p2pify.com/3641909480ec9fe92eae77278079095d",
        },
        preferred: true,
      },
    ];
    this.onboard = Onboard({
      dappId: config.BNC_ONBOARD.API_KEY,
      networkId: config.BNC_ONBOARD.NETWORK_ID,
      subscriptions,
      walletSelect: {
        wallets,
      },
      // Override default walletCheck to skip network selection
      walletCheck: [{ checkName: "connect" }],
    });

    return !!this.onboard;
  }

  /**
   *
   * Asks the user to select a wallet *AND* to give the dapp persmission to use it.
   *
   * @returns `true` if a wallet selected & connected, `false` otherwise
   */
  async connect(walletName) {
    try {
      await this.onboard.walletSelect(walletName);
      const readyToTransact = await this.onboard.walletCheck();
      return Boolean(readyToTransact); // casting to boolean because it can be undefined
    } catch (error) {
      return false;
    }
  }

  async changeNetwork(network) {
    const { NETWORK_SETTINGS } = config;
    const networkSettings = NETWORK_SETTINGS[network];
    const networkId = networkSettings.networkId;
    if (this.onboard) {
      this.onboard.config({ networkId });
      try {
        await this.onboard.getState().wallet.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${networkId.toString(16)}` }],
        });
        return true;
      } catch (error) {
        if (error.code === 4902) {
          try {
            await this.onboard.getState().wallet.provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${networkId.toString(16)}`,
                  chainName: networkSettings.name,
                  nativeCurrency: networkSettings.nativeCurrency,
                  rpcUrls: [networkSettings.rpcUrl],
                  blockExplorerUrls: [networkSettings.blockExplorerUrl],
                },
              ],
            });
            return true;
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    }

    return false;
  }

  disconnect() {
    this.onboard.walletReset();
  }
}
