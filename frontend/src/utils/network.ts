import CONFIG from "../config";
import { ChainId } from "../state/reducers/tokenListSlice";
import { NetworkName } from "../state/reducers/widoSlice";

export const getNetworkId = (network: NetworkName): ChainId => {
  switch (network) {
    case "mainnet":
      return 1;
    case "goerli":
      return 5;
    case "fantom":
      return 250;
    case "arbitrum":
      return 42161;
    case "avalanche":
      return 43114;
    case "moonriver":
      return 1285;
    case "polygon":
      return 137;
    case "celo":
      return 42220;
    case "phuture":
      return 1338;
    default:
      return 1;
  }
};

export const getNetwork = (networkId: ChainId): NetworkName => {
  switch (networkId) {
    case 1:
      return "mainnet";
    case 5:
      return "goerli";
    case 250:
      return "fantom";
    case 43114:
      return "avalanche";
    case 42161:
      return "arbitrum";
    case 1285:
      return "moonriver";
    case 137:
      return "polygon";
    case 42220:
      return "celo";
    case 1338:
      return "phuture";
    default:
      return "other";
  }
};

export const getNetworkExplorerURL = (networkId) => {
  if (networkId == undefined) {
    return "";
  }
  return CONFIG.NETWORK_SETTINGS[getNetwork(networkId)].blockExplorerUrl;
};

export const getNetworkExplorerURLFromName = (networkName) => {
  return CONFIG.NETWORK_SETTINGS[networkName].blockExplorerUrl;
};
