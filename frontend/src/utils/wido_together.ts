import { Vault, VaultActionType, WidoTogetherAction } from "../state/apiSlice";
import { ChainId } from "../state/reducers/tokenListSlice";
import { NetworkName } from "../state/reducers/widoSlice";
import { DEPOSIT_KEY, MIGRATION_KEY, WITHDRAW_KEY } from "./label";

/**
 *
 * @param chainIdOrNetwork
 * @returns true if network supports batch transactions, false if it supports gas-free transactions
 */
export function hasBatchTx(chainIdOrNetwork: ChainId | NetworkName) {
  if (typeof chainIdOrNetwork === "number") {
    const chainId = chainIdOrNetwork;
    return chainId === 1 || chainId === 1338;
  }

  const network = chainIdOrNetwork;
  return network === "mainnet" || network === "phuture";
}

export function isActionSupported(
  wido_together: WidoTogetherAction[],
  type: VaultActionType
) {
  switch (type) {
    case "WITHDRAW":
      return wido_together.includes(WITHDRAW_KEY);
    case "SWAP":
      return wido_together.includes(MIGRATION_KEY);
    case "DEPOSIT":
      return wido_together.includes(DEPOSIT_KEY);
    default:
      return false;
  }
}

type TxSupport = "none" | "gasless" | "gas-free";

export function getVaultTxSupport(
  vault: Vault,
  type: VaultActionType
): TxSupport {
  const supported = isActionSupported(vault.wido_together, type);

  if (!supported) return "none";

  return hasBatchTx(vault.chain_id) ? "gasless" : "gas-free";
}
