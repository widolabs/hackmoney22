import { VaultActionType } from "../state/apiSlice";

export const MIGRATION_KEY = "Migration";
export const DEPOSIT_KEY = "Deposit";
export const WITHDRAW_KEY = "Withdraw";

export type WIDO_TOGETHER_ACTION = "Migration" | "Deposit" | "Withdraw";

export const WIDO_TOGETHER_MAPPING: Record<
  VaultActionType,
  WIDO_TOGETHER_ACTION
> = {
  WITHDRAW: WITHDRAW_KEY,
  SWAP: MIGRATION_KEY,
  DEPOSIT: DEPOSIT_KEY,
};

const chains = {
  1: "Ethereum",
  250: "Fantom",
  43114: "Avalanche",
  1285: "Moonriver",
  137: "Polygon",
  42220: "Celo",
  1338: "Phuture",
};

const chainIds = {
  Ethereum: 1,
  Fantom: 250,
  Avalanche: 43114,
  Moonriver: 1285,
  Polygon: 137,
  Celo: 42220,
  Phuture: 1338,
};

const gaslessDictionary = {
  [MIGRATION_KEY]: "Migrate gaslessly",
  [DEPOSIT_KEY]: "Deposit gaslessly",
  [WITHDRAW_KEY]: "Withdraw gaslessly",
};

const gasFreeDictionary = {
  [MIGRATION_KEY]: "Migrate gas-free",
  [DEPOSIT_KEY]: "Deposit gas-free",
  [WITHDRAW_KEY]: "Withdraw gas-free",
};

export const WIDO_TOGETHER_LABEL = {
  1: gaslessDictionary,
  250: gasFreeDictionary,
  43114: gasFreeDictionary,
  1285: gaslessDictionary,
  137: gaslessDictionary,
  42220: gaslessDictionary,
  1338: gaslessDictionary,
};

export function getChainLabel(key) {
  return chains[key];
}

export function getChainId(label) {
  return chainIds[label];
}
