import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { isEmpty } from "lodash";
import { byTokenBalance } from "./vaultSlice";

/**
 * Example:
 *
 * ```json
 * address: "0x0A913beaD80F321E7Ac35285Ee10d9d922659cB7"
 * chainId: 1
 * decimals: 18
 * logoURI: "https://storage.googleapis.com/zapper-fi-assets/tokens/ethereum/0x0a913bead80f321e7ac35285ee10d9d922659cb7.png"
 * name: "DOS Network"
 * symbol: "DOS"
 * ```
 */
export type Token = {
  address: string;
  chainId?: number;
  decimals: number;
  // Vault tokens might have an array
  logoURI: string[] | string;
  name: string;
  symbol: string;
};

export type ChainId = 1 | 250 | 43114 | 42161 | 5 | 1285 | 137 | 42220 | 1338;

export type TokenList = Record<ChainId, Record<string, Token>>;

type TokenListState = {
  tokens: TokenList;
};
const initialState: TokenListState = {
  tokens: {
    1: {},
    250: {},
    43114: {},
    42161: {},
    5: {},
    1285: {},
    137: {},
    42220: {},
    1338: {},
  },
};

export const tokenListSlice = createSlice({
  name: "tokenList",
  initialState,
  reducers: {
    setTokenList: (state, action) => {
      for (const chainId in state.tokens) {
        state.tokens[chainId] = action.payload[chainId] || {};
      }
    },
  },
});

function getPlaceholder(tokenAddress: string) {
  const address = tokenAddress
    ? tokenAddress
    : "0x0000000000000000000000000000000000000000";

  return {
    address,
    name: address.slice(0, 6),
    symbol: address.slice(0, 6),
    logoURI: "missing", // This allows `Avatar` to fallback to the first letter of the `alt` text
  } as Token;
}

export const selectTokenByAddress =
  (chainId: ChainId, address: string) => (state: RootState) =>
    state.tokenList.tokens[chainId][address] || getPlaceholder(address);

export const selectTokenListForSwaps = (state: RootState) => {
  if (isEmpty(state.tokenList.tokens[1])) return [];

  return [
    state.tokenList.tokens[1]["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
    state.tokenList.tokens[137]["0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"], //this one has chainId as string
    state.tokenList.tokens[250]["0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"],
    state.tokenList.tokens[43114]["0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"],
    state.tokenList.tokens[1]["0x6B175474E89094C44Da98b954EedeAC495271d0F"],
    state.tokenList.tokens[250]["0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E"],
    state.tokenList.tokens[43114]["0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"],
  ]
    .map(
      (token) =>
        ({
          display_name: token.symbol,
          chain_id: parseInt(token.chainId),
          icon: [token.logoURI],
          ...token,
        } as Vault)
    )
    .sort(byTokenBalance(state.token.user.tokenBalances));
};

// Action creators are generated for each case reducer function
export const { setTokenList } = tokenListSlice.actions;

export default tokenListSlice.reducer;
