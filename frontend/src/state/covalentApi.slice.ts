import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { ChainId } from "./reducers/tokenListSlice";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ThunkConfigShape } from "./store";
import { Address } from "./apiSlice";
import { patchUserTokens } from "./reducers/tokenSlice";
import { getNetwork } from "../utils/network";

const BASE_URL = "https://api.covalenthq.com/v1";
const API_KEY = "ckey_8fbeebb560fe43bfa073019c584";

type FetchBalancesQueryArgs = { chainId: ChainId; address: string };

type CovalentBalancesResult = {
  data: {
    address: Address;
    items: Array<{
      // Example: "115182887398"
      balance: string;
      contract_address: Address;
      // Example: 18
      contract_decimals: number;
      // Example: "Moo Boo USDC-MAI"
      contract_name: string;
      // Example: "mooBooUSDC-MAI"
      contract_ticker_symbol: string;
      // supports_erc: ["erc20"];
      // type: "cryptocurrency";
    }>;
    chain_id: ChainId;
    quote_currency: "USD";
    /**
     * Example: "2022-04-18T14:05:07.912583601Z"
     */
    updated_at: string;
  };
  error: boolean;
  error_code: number;
  error_message: string;
};

export const covalentApiSlice = createApi({
  reducerPath: "covalentApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    fetchBalances: builder.query<
      CovalentBalancesResult,
      FetchBalancesQueryArgs
    >({
      query: ({ chainId, address }: FetchBalancesQueryArgs) =>
        `/${chainId}/address/${address}/balances_v2/?key=${API_KEY}`,
    }),
  }),
});

export const fetchAllUserBalances = createAsyncThunk<
  void,
  string,
  ThunkConfigShape
>("covalentApi/fetchAllUserBalances", async (address, thunkAPI) => {
  const { dispatch } = thunkAPI;

  const chainIds: Array<ChainId> = [1, 250, 43114];

  const promises = chainIds.map((chainId) =>
    dispatch(
      covalentApiSlice.endpoints.fetchBalances.initiate({ chainId, address })
    )
      .then((response) => {
        if (!response.data) throw Error("API returned nothing.");

        return response.data.data.items.reduce(
          (prev: Record<string, string>, current) => {
            prev[current.contract_address.toLowerCase()] = current.balance;
            return prev;
          },
          {}
        );
      })
      .then((userTokenMap) => {
        dispatch(
          patchUserTokens({ network: getNetwork(chainId), userTokenMap })
        );
      })
  );

  await Promise.all(promises);
});

export const { useFetchBalancesQuery } = covalentApiSlice;
