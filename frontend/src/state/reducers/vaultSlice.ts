import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  filterByDisplayNameOrAddress,
  filterByChainId,
  filterByProvider,
  filterByBaseToken,
  filterByTvl,
  filterByExcludeBaseToken,
} from "../../utils/vaultFilters";
import { Vault } from "../apiSlice";
import { createSelector } from "reselect";
import { RootState } from "../store";
import CONFIG from "../../config";
import { ChainId } from "./tokenListSlice";
import { getNetwork } from "../../utils/network";
import { parseTokenBalance } from "./tokenSlice";
import { getChainLogo, ImageURI } from "../../utils/logo";
import { DEPOSIT_KEY } from "../../utils/label";

type ChainName =
  | "Ethereum"
  | "Fantom"
  | "Avalanche"
  | "Moonriver"
  | "Polygon"
  | "Celo"
  | "Goerli"
  | "Arbitrum"
  | "Phuture";

export const chainIdMapping: Record<ChainId, ChainName> = {
  1: "Ethereum",
  250: "Fantom",
  43114: "Avalanche",
  1285: "Moonriver",
  137: "Polygon",
  42220: "Celo",
  5: "Goerli",
  42161: "Arbitrum",
  1338: "Phuture",
};

const SORT_BY_APY_DESC = "APY_DESC";
const SORT_BY_APY_ASC = "APY_ASC";
const SORT_BY_TVL_DESC = "TVL_DESC";
const SORT_BY_TVL_ASC = "TVL_ASC";

export const SORT_VALUES = [
  SORT_BY_APY_DESC,
  SORT_BY_APY_ASC,
  SORT_BY_TVL_DESC,
  SORT_BY_TVL_ASC,
];

export type SortByType = "APY_DESC" | "APY_ASC" | "TVL_DESC" | "TVL_ASC";

export const VAULT_SORT_CONFIG = {
  [SORT_BY_APY_DESC]: {
    label: "APY ↓",
    sortFn: (vault1, vault2) => {
      if (vault1.apy > vault2.apy) {
        return -1;
      }

      return 1;
    },
  },
  [SORT_BY_APY_ASC]: {
    label: "APY ↑",
    sortFn: (vault1, vault2) => {
      if (vault1.apy < vault2.apy) {
        return -1;
      }

      return 1;
    },
  },
  [SORT_BY_TVL_DESC]: {
    label: "TVL ↓",
    sortFn: (vault1, vault2) => {
      if (vault1.tvl.tvl_in_usd > vault2.tvl.tvl_in_usd) {
        return -1;
      }

      return 1;
    },
  },
  [SORT_BY_TVL_ASC]: {
    label: "TVL ↑",
    sortFn: (vault1, vault2) => {
      if (vault1.tvl.tvl_in_usd < vault2.tvl.tvl_in_usd) {
        return -1;
      }

      return 1;
    },
  },
};

const sortVaults = (vaultsData, sortBy) => {
  const vaultsDataCopy = [...vaultsData];

  return vaultsDataCopy.sort(VAULT_SORT_CONFIG[sortBy].sortFn);
};

export const byTokenBalance = (tokenBalances) => (x: Vault, y: Vault) => {
  const balanceOfX = parseTokenBalance(
    tokenBalances[getNetwork(x.chain_id)][x.address.toLowerCase()]
  );

  const balanceOfY = parseTokenBalance(
    tokenBalances[getNetwork(y.chain_id)][y.address.toLowerCase()]
  );

  if (balanceOfX.gt(0) && balanceOfY.gt(0)) {
    return 0;
  }

  if (balanceOfX.gt(0)) {
    return -1;
  }

  return 1;
};

type FilterQueryType = GenericFilterList & {
  display_name: string;
  address: string;
};

const filterVaultList = (
  vaultList,
  filterQuery: FilterQueryType,
  sortBy,
  tokenList,
  minTvl,
  tokenBalances
) => {
  let vaultData = filterByDisplayNameOrAddress(
    vaultList,
    filterQuery.display_name || filterQuery.address
  );
  vaultData = filterByExcludeBaseToken(
    vaultData,
    filterQuery.exclude_base_token,
    tokenList
  );
  vaultData = filterByBaseToken(vaultData, filterQuery.base_token, tokenList);
  vaultData = filterByChainId(vaultData, filterQuery.chain, chainIdMapping);
  vaultData = filterByProvider(vaultData, filterQuery.provider);
  vaultData = filterByTvl(vaultData, minTvl);

  return sortVaults(vaultData, sortBy).sort(byTokenBalance(tokenBalances));
};

type EnhancedGenericFilterList = {
  exclude_base_token: Record<string, ImageURI>;
  base_token: Record<string, ImageURI>;
  chain: Record<string, ImageURI>;
  provider: Record<string, ImageURI>;
};

type GenericFilterList = {
  exclude_base_token: string[];
  base_token: string[];
  chain: string[];
  provider: string[];
};

type VaultState = {
  vaultList: Vault[];
  lastSearchedVault: string;
  minTvl: number;
  sortByKey: SortByType;
  lastGenericFilterList: GenericFilterList;
  pageNumber: number;
};

const initialState: VaultState = {
  vaultList: [],
  lastSearchedVault: "",
  minTvl: 100000, // $100k
  sortByKey: SORT_BY_APY_DESC,
  lastGenericFilterList: {
    exclude_base_token: [],
    base_token: [],
    chain: [],
    provider: [],
  },
  pageNumber: 1,
};

export const vaultSlice = createSlice({
  name: "vault",
  initialState,
  reducers: {
    setVaultList: (state, action) => {
      state.vaultList = action.payload;
    },
    setLastGenericFilterList: (state, action) => {
      state.lastGenericFilterList = action.payload;
    },
    patchLastGenericFilterList: (
      state,
      action: PayloadAction<Partial<GenericFilterList>>
    ) => {
      state.lastGenericFilterList = Object.assign(
        {},
        state.lastGenericFilterList,
        action.payload
      );
    },
    setLastSearchedVault: (state, action: PayloadAction<string>) => {
      state.lastSearchedVault = action.payload;
    },
    setMinTvl: (state, action: PayloadAction<number>) => {
      state.minTvl = action.payload;
    },
    setSortByKey: (state, action: PayloadAction<SortByType>) => {
      state.sortByKey = action.payload;
    },
    resetPageNumber: (state) => {
      state.pageNumber = 1;
    },
    incrementPageNumber: (state) => {
      state.pageNumber = state.pageNumber + 1;
    },
  },
});

export const selectDistinctGenericFilterList = createSelector(
  (state: RootState) => state.vault.vaultList,
  (state: RootState) => state.tokenList.tokens,
  (vaultList, tokenList): EnhancedGenericFilterList => {
    const chainMap: Record<string, ImageURI> = {};
    const providerMap: Record<string, ImageURI> = {};
    const baseTokenMap: Record<string, ImageURI> = {};
    //
    vaultList.forEach((vault) => {
      providerMap[vault.provider] = "";
      chainMap[chainIdMapping[vault.chain_id]] = getChainLogo(vault.chain_id);

      vault.base_token.forEach((tokenAddress) => {
        const token = tokenList[vault.chain_id][tokenAddress];
        if (token && !baseTokenMap[token.symbol]) {
          baseTokenMap[token.symbol] = token.logoURI;
        }
      });
    });

    const genericFilterList: EnhancedGenericFilterList = {
      provider: providerMap,
      chain: chainMap,
      base_token: baseTokenMap,
      exclude_base_token: baseTokenMap,
    };
    return genericFilterList;
  }
);

export const selectFilteredVaultList = createSelector(
  (state: RootState) => state.vault,
  (state: RootState) => state.tokenList.tokens,
  (state: RootState) => state.token.user.tokenBalances,
  (vaultSlice, tokenList, tokenBalances) => {
    const filteredVaultData = filterVaultList(
      vaultSlice.vaultList,
      {
        display_name: vaultSlice.lastSearchedVault,
        address: vaultSlice.lastSearchedVault,
        ...vaultSlice.lastGenericFilterList,
      },
      vaultSlice.sortByKey,
      tokenList,
      vaultSlice.minTvl,
      tokenBalances
    );
    return filteredVaultData as Vault[];
  }
);
export const selectVaultListForSwaps = createSelector(
  (state: RootState) => state.vault,
  (state: RootState) => state.tokenList.tokens,
  (state: RootState) => state.token.user.tokenBalances,
  (vaultSlice, tokenList, tokenBalances) => {
    const vaults = vaultSlice.vaultList.filter((vault) =>
      vault.wido_together.includes(DEPOSIT_KEY)
    );
    return sortVaults(vaults, "TVL_DESC").sort(byTokenBalance(tokenBalances));
  }
);

export const selectPageFromFilteredVaultList = (pageNumber: number) =>
  createSelector(selectFilteredVaultList, (filteredVaultData) =>
    filteredVaultData.slice(0, pageNumber * CONFIG.UX.VAULTS_PER_PAGE)
  );

// Action creators are generated for each case reducer function
export const {
  setVaultList,
  setLastSearchedVault,
  setLastGenericFilterList,
  setMinTvl,
  patchLastGenericFilterList,
  setSortByKey,
  resetPageNumber,
  incrementPageNumber,
} = vaultSlice.actions;

export default vaultSlice.reducer;
