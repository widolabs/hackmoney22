import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { ChainId } from "./reducers/tokenListSlice";

const BASE_URL = "https://api.coingecko.com/api/v3/";
const MARKET_DATA_INTERVAL = 60; // in days

const CK_ASSET_PLATFORM = {
  1: "ethereum",
  250: "fantom",
  43114: "avalanche",
};

type CoinDataResult = {
  /**
   * Example: `dola-usd`
   */
  id: string;
  description: {
    en: string;
  };
  market_data: {
    market_cap: { usd: number };
    current_price: { usd: number };
  };
  links: {
    homepage: string[];
  };
};
type CoinDataQueryArgs = { chainId: ChainId; contractAddress: string };

/**
 * Example: [1642118400000, 1.0008938665523355]
 */
type MarketDataPoint = [number, number];

type MarketDataResult = {
  market_caps: MarketDataPoint[];
  prices: MarketDataPoint[];
  total_volumes: MarketDataPoint[];
};

export const coingeckoApiSlice = createApi({
  reducerPath: "coingeckoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    fetchCoinData: builder.query<CoinDataResult, CoinDataQueryArgs>({
      query: ({ chainId, contractAddress }: CoinDataQueryArgs) =>
        `/coins/${
          CK_ASSET_PLATFORM[chainId]
        }/contract/${contractAddress.toLowerCase()}?tickers=false&community_data=false&developer_data=false&sparkline=false`,
    }),
    fetchMarketData: builder.query<MarketDataResult, string>({
      query: (coinId: string) =>
        `/coins/${coinId}/market_chart?vs_currency=usd&days=${MARKET_DATA_INTERVAL}&interval=daily`,
    }),
  }),
});

export const { useFetchCoinDataQuery, useFetchMarketDataQuery } =
  coingeckoApiSlice;
