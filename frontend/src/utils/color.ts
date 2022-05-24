import { ChainId } from "../state/reducers/tokenListSlice";

const chains: Record<ChainId, string> = {
  1: "#454a75",
  250: "#1969ff",
  43114: "#e84142",
  1285: "#ffa500",
  137: "#8247e5",
  42220: "#ffa500",
  42161: "#000",
  5: "#000",
  1338: "#000",
};

export function getChainColor(chainId: ChainId) {
  return chains[chainId];
}
