import { ChainId } from "../state/reducers/tokenListSlice";

/**
 * Example: `https://raw.githubusercontent.com/ava-labs/avalanche-bridge-resources/main/tokens/DAI/logo.png`
 */
export type ImageURI = string;

const chains: Record<ChainId, ImageURI> = {
  1: new URL("../assets/ethereum-logo.svg", import.meta.url).href,
  250: new URL("../assets/fantom-logo.svg", import.meta.url).href,
  43114: new URL("../assets/avalanche-logo.svg", import.meta.url).href,
  1285: new URL("../assets/moonriver-logo.svg", import.meta.url).href,
  137: new URL("../assets/polygon-logo.svg", import.meta.url).href,
  42220: new URL("../assets/celo-logo.svg", import.meta.url).href,
  42161: "",
  1338: new URL("../assets/ethereum-logo.svg", import.meta.url).href,
  5: "",
};

export function getChainLogo(chainId: ChainId): ImageURI {
  return chains[chainId];
}
