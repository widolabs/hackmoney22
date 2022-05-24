import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChainId, setTokenList } from "./reducers/tokenListSlice";

import config from "../config";
import { setVaultList } from "./reducers/vaultSlice";
import extraVaults from "../data/extraVaults";
import { QueryReturnValue } from "@reduxjs/toolkit/dist/query/baseQueryTypes";

export type WidoTogetherAction = "Migration" | "Deposit" | "Withdraw";
export type VaultActionType = "WITHDRAW" | "DEPOSIT" | "SWAP" | "MINT" | "CROSS_CHAIN_ORDER";


export const VAULT_ACTION_TYPES: Array<VaultActionType> = [
  "WITHDRAW",
  "DEPOSIT",
  "SWAP",
];
export function isVaultActionType(value: string): value is VaultActionType {
  return VAULT_ACTION_TYPES.includes(value as VaultActionType);
}

type PeggedToken = "USD";
/**
 * Example: `0x3B96d491f067912D18563d56858Ba7d6EC67a6fa`
 */
export type Address = string;

export type Vault = {
  chain_id: ChainId;
  address: Address;
  wido_together: WidoTogetherAction[];
  apy: number;
  decimals: number;
  /**
   * E.g.: `yearn.finance`
   */
  provider: string;
  symbol: string;
  tvl: {
    tvl_in_token: number;
    tvl_in_usd: number;
  };
  icon: string[];
  display_name: string;
  pegged_token: PeggedToken[];
  base_token: string[];
  underlying_token_address: Address;
  // version: string;
  // id: number;
  // raw_data: {};
};

type Fee = {
  amount: number;
  /**
   * Example: `Performance fee"
   */
  display_name: string;
  id: "performance" | "management";
};

type ProtocolDetails = {
  /**
   * Example: `https://twitter.com/iearnfinance`
   */
  link: string;
  /**
   * Example: `yearn.finance`
   */
  name: string;
};

export type VaultDetails = {
  address: Address;
  chain_id: ChainId;
  deposit_token: Address[];
  entity_inception_timestamp: number;
  fees: Fee[];
  migration_address: Address;
  pnl_sim_token: Address[];
  protocol: ProtocolDetails;
  strategy_info: string;
};

type Token = {
  address: Address;
  chainId: ChainId;
  decimals: number;
  logoURI: string;
  name: string;
  symbol: string;
};

export type HistoricalAPYRaw = {
  /**
   * Example: `1645315200000`
   */
  timestamp: number;
  /**
   * E.g.: "2022/02/22"
   * @deprecated
   */
  // date: string;
  net_apy: number;
  tvl: number;
  total_assets: number;
};

/**
 * Example:
 *
 * ```json
 * {
 *  deposit_fee: "14.288 USDC"
 *  deposit_fee_token: "14.288"
 *  total_fee: "29.846 USDC"
 *  total_fee_token: "29.846"
 *  withdraw_fee: "15.558 USDC"
 *  withdraw_fee_token: "15.558"
 *}
 * ```
 */
type PricingBreakdown = {
  deposit_fee: string;
  deposit_fee_token: string;
  total_fee: string;
  total_fee_token: string;
  withdraw_fee: string;
  withdraw_fee_token: string;
};

type ROIDataType = {
  pricing: [PricingBreakdown, PricingBreakdown];
  /**
   * E.g.: 0.1
   */
  slippage: number;
  /**
   * E.g.: "USDC"
   */
  token_symbol: string;
};

type TransactionQueueResult = {
  from_vault: Address;
  pending_txs: Array<{
    /**
     * Example: `56409297412306260000`
     */
    amount: 56409297412306260000;
    /**
     * Example: `"56.409"`
     */
    display_amount: "56.409";
    /**
     * Example: `"https://argon-radius-316407.appspot.com/static/Cat.png"`
     */
    profile_pic: string;
    /**
     * Example: `"0xB1bF7756289Eaa0988265884cF5b480111FC56eB"`
     */
    user: string;
    /**
     * Example: `1652868485`
     */
    joined_timestamp: number;
  }>;
  to_vault: Address;
  /**
   * Example: `56409297412306260000`
   */
  total_amount: number;
  /**
   * Example: `"56.409"`
   */
  total_display_amount: string;
};

export const widoApiSlice = createApi({
  reducerPath: "api", // it's recommended to only have one createApi for each server we communicate with
  tagTypes: ["Queue"],
  baseQuery: fetchBaseQuery({
    baseUrl: config.WIDO_API_URL,
  }),
  endpoints(builder) {
    return {
      fetchVaults: builder.query<Vault[], void>({
        // query accepts parameters in case we want to limit
        // the amount we fetch or implement pagination
        query() {
          if (config.DEBUG) {
            return "/all?base_token=USD&include_test_providers=true";
          } else {
            return "/all?base_token=USD";
          }
        },
        transformResponse: (responseData: { entities: Vault[] }) => {
          return responseData.entities.concat(extraVaults.entities);
        },
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          // `onStart` side-effect
          try {
            const { data } = await queryFulfilled;
            // `onSuccess` side-effect
            dispatch(setVaultList(data));
          } catch (err) {
            // `onError` side-effect
          }
        },
      }),
      fetchVaultDetail: builder.query<VaultDetails, Vault>({
        async queryFn(vault, api, extraOptions, baseQuery) {
          const vaultData = extraVaults.entities.find(
            (v) => v.address == vault.address
          );
          if (vaultData) {
            return { data: vaultData?.details };
          } else {
            const response = (await baseQuery(
              `/${vault.address}/detail?chain_id=${vault.chain_id}`
            )) as QueryReturnValue<{ data: VaultDetails }, FetchBaseQueryError>;

            return response.data ? response.data : response;
          }
        },
      }),
      fetchVaultHistoricalApy: builder.query<
        HistoricalAPYRaw[],
        { vaultAddress: string; days: number }
      >({
        async queryFn({ vaultAddress, days }, api, extraOptions, baseQuery) {
          const vaultData = extraVaults.entities.find(
            (v) => v.address == vaultAddress
          );

          let response: QueryReturnValue<
            { data: HistoricalAPYRaw[] },
            FetchBaseQueryError
          >;

          if (vaultData) {
            response = {
              data: {
                data: vaultData.historical,
              },
            };
          } else {
            response = (await baseQuery(
              `/historical/${vaultAddress}?days=${days}`
            )) as QueryReturnValue<
              { data: HistoricalAPYRaw[] },
              FetchBaseQueryError
            >;
          }

          if (!response.data) return response;

          const data = response.data.data.map((item) => ({
            ...item,
            // Subtract a day & fix the timestamp (is missing 3 zeroes)
            timestamp: (item.timestamp - 86400) * 1000,
          }));

          return { data };
        },
      }),
      fetchTokenList: builder.query<any, void>({
        query() {
          return "/tokenlist";
        },
        transformResponse: (responseData: any) => {
          const byId: { [chainId: number]: { [address: string]: Token } } =
            responseData.tokens.reduce((byId, token) => {
              if (byId[token.chainId] == undefined) {
                byId[token.chainId] = {};
              }
              byId[token.chainId][token.address] = token;
              return byId;
            }, {});

          return {
            entities: byId,
            ids: Object.keys(byId),
          };
        },
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          // `onStart` side-effect
          try {
            const { data } = await queryFulfilled;
            // `onSuccess` side-effect
            await dispatch(setTokenList(data.entities));
          } catch (err) {
            console.log("📜 LOG > onQueryStarted > err", err);
            // `onError` side-effect
          }
        },
      }),
      fetchTransactionQueue: builder.query<
        TransactionQueueResult,
        {
          type: VaultActionType;
          fromTokenAddress: Address;
          toTokenAddress: Address;
        }
      >({
        query({ type, fromTokenAddress, toTokenAddress }) {
          if (type === "WITHDRAW") {
            return `/pool/withdraw/${fromTokenAddress}/${toTokenAddress}`;
          } else if (type === "DEPOSIT") {
            return `/together/deposit/${toTokenAddress}/${fromTokenAddress}`;
          } else if (type === "SWAP") {
            return `/together/swap/${fromTokenAddress}/${toTokenAddress}`;
          }
          throw new Error("Tx type not supported.");
        },
        providesTags: (result, error, { fromTokenAddress, toTokenAddress }) => [
          { type: "Queue", id: fromTokenAddress + toTokenAddress },
        ],
      }),
      fetchUserProfile: builder.query({
        query(userWalletAddress) {
          return `/account/profile/${userWalletAddress}`;
        },
        transformResponse: (responseData) => {
          return responseData;
        },
      }),
      addMailchimpSubscriber: builder.mutation({
        query: function (body) {
          const email = encodeURIComponent(body);

          return {
            url: `/mailchimp/${email}`,
            method: "POST",
            body,
          };
        },
      }),
      fetchROIv3: builder.query<ROIDataType, Vault>({
        query(vault: Vault) {
          return `/roi_v3/${vault.underlying_token_address}/${vault.address}`;
        },
      }),
      addToVaultWithdrawalQueue: builder.mutation({
        query: function (body) {
          return {
            url: "/pool/withdraw",
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, body) => [
          {
            type: "Queue",
            id: body.withdraw.vault + body.withdraw.token,
          },
        ],
      }),
      addToVaultDepositQueue: builder.mutation({
        query: function (body) {
          return {
            url: "/pool/deposit",
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, body) => [
          {
            type: "Queue",
            id: body.deposit.token + body.deposit.vault,
          },
        ],
      }),
      addToVaultSwapQueue: builder.mutation({
        query: function (body) {
          return {
            url: "/pool/swap",
            method: "POST",
            body,
          };
        },
        invalidatesTags: (result, error, body) => [
          {
            type: "Queue",
            id: body.swap.from_vault + body.swap.to_vault,
          },
        ],
      }),
      addToOrder: builder.mutation({
        query: function (body) {
          return {
            url: "/order",
            method: "POST",
            body,
          };
        },
      }),
      fetchSwapRoute: builder.query({
        query({ chainId, fromTokenAddress, toTokenAddress, amount }) {
          return `/swaproute?chain_id=${chainId}&from_address=${fromTokenAddress}&to_address=${toTokenAddress}&amount=${amount}`;
        },
      }),
      fetchCrossChainSwapRoute: builder.query({
        query({
          user,
          fromChainId,
          fromTokenAddress,
          toChainId,
          toTokenAddress,
          amount,
        }) {
          return `/swaproute/${fromChainId}/${toChainId}?user=${user}&from_address=${fromTokenAddress}&to_address=${toTokenAddress}&amount=${amount}`;
        },
      }),
    };
  },
});

export const {
  useFetchVaultsQuery,
  useFetchVaultHistoricalApyQuery,
  useFetchVaultDetailQuery,
  useFetchTokenListQuery,
  useFetchTransactionQueueQuery,
  useFetchUserProfileQuery,
  useAddMailchimpSubscriberMutation,
  useAddToVaultWithdrawalQueueMutation,
  useFetchROIv3Query,
  useAddToVaultDepositQueueMutation,
} = widoApiSlice;
