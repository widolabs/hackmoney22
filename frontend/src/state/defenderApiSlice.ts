import { createApi } from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query";

const DEFENDER_BASE_URL = "https://api.defender.openzeppelin.com";

/**
 * Example:
 *
 * ```json
 * {
 *   "autotaskRunId": "d7b60778-79c9-4fda-a0b2-d3724305fac3",
 *   "autotaskId": "a7451aab-6e6d-49a9-936b-f885532d6979",
 *   "trigger": "webhook",
 *   "status": "success",
 *   "createdAt": "2022-04-04T12:28:10.478Z",
 *   "encodedLogs": "ZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZjAwMDAwMDAwM==",
 *   "result": "{\"txHash\":\"0x23f8d4d7fa483754ecbc0b1d8c9e55cb918be73e891e4049e3e78b2165a6cec3\"}",
 *   "requestId": "95f05b7a-2e9b-4e29-b94b-1881b81885d6"
 * }
 * ```
 */
type DefenderMetaTxResponse = {
  autotaskRunId: string;
  autotaskId: string;
  trigger: "webhook";
  status: "error" | "success";
  createdAt: string;
  encodedLogs: string;
  result: string;
  requestId: string;
};

type SendMetaTxResult = { txHash: string };

export const defenderApiSlice = createApi({
  reducerPath: "defenderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: DEFENDER_BASE_URL,
  }),
  endpoints(builder) {
    return {
      sendMetaTx: builder.mutation({
        query: function (body) {
          const { network } = body;
          const urlMap = {
            avalanche:
              "/autotasks/644b6a2e-5531-46da-9ae3-918211d31a5e/runs/webhook/af9c70a8-ba13-4eaa-8452-df9688e4c996/5QuN4HfprSB9vqusticVTC",
            fantom:
              "/autotasks/a7451aab-6e6d-49a9-936b-f885532d6979/runs/webhook/af9c70a8-ba13-4eaa-8452-df9688e4c996/4D8wp79UdVh1RP5CVmFnrF",
          };
          return {
            url: urlMap[network],
            method: "POST",
            body: {
              order: body.order,
              signature: body.signature,
              swapRoute: body.swapRoute,
            },
          };
        },
        transformResponse: (responseData: DefenderMetaTxResponse) => {
          if (responseData.status === "error") {
            return new Error("Transaction failed");
          }
          const result: SendMetaTxResult = JSON.parse(responseData.result);
          const { txHash } = result;
          return txHash;
        },
      }),
    };
  },
});

export const { useSendMetaTxMutation } = defenderApiSlice;
