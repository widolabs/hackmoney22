import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import { ethers } from "ethers";
import { Address, VaultActionType } from "../apiSlice";
import { RootState, ThunkConfigShape } from "../store";

import { changeWalletNetwork } from "./currentUserSlice";
import { NetworkName } from "./widoSlice";

type LowerCaseAddress = string;

type TokenState = {
  user: {
    tokenBalances: {
      mainnet: Record<LowerCaseAddress, string>;
      fantom: Record<LowerCaseAddress, string>;
      avalanche: Record<LowerCaseAddress, string>;
      moonriver: Record<LowerCaseAddress, string>;
      polygon: Record<LowerCaseAddress, string>;
      celo: Record<LowerCaseAddress, string>;
      phuture: Record<LowerCaseAddress, string>;
    };
    userTokensAllowancesMap: {
      mainnet: Record<string, string>;
      fantom: Record<string, string>;
      avalanche: Record<string, string>;
      moonriver: Record<string, string>;
      polygon: Record<string, string>;
      celo: Record<string, string>;
      phuture: Record<string, string>;
    };
    userTokensActionsMap: {
      mainnet: Record<string, { isApproving: boolean }>;
      fantom: Record<string, { isApproving: boolean }>;
      avalanche: Record<string, { isApproving: boolean }>;
      moonriver: Record<string, { isApproving: boolean }>;
      polygon: Record<string, { isApproving: boolean }>;
      celo: Record<string, { isApproving: boolean }>;
      phuture: Record<string, { isApproving: boolean }>;
    };
  };
};

export const initialState: TokenState = {
  user: {
    tokenBalances: {
      mainnet: {},
      fantom: {},
      avalanche: {},
      moonriver: {},
      polygon: {},
      celo: {},
      phuture: {},
    },
    userTokensAllowancesMap: {
      mainnet: {},
      fantom: {},
      avalanche: {},
      moonriver: {},
      polygon: {},
      celo: {},
      phuture: {},
    },
    userTokensActionsMap: {
      mainnet: {},
      fantom: {},
      avalanche: {},
      moonriver: {},
      polygon: {},
      celo: {},
      phuture: {},
    },
  },
};

type TokenApproveParams = {
  network: NetworkName;
  tokenAddress: string;
  spenderAddress: string;
  vault_action_type: VaultActionType;
};

type TokenApproveResult = {
  amount: string;
};

export const approve = createAsyncThunk<
  TokenApproveResult,
  TokenApproveParams,
  ThunkConfigShape
>("tokens/approve", async (payload, thunkAPI) => {
  const { network, tokenAddress, spenderAddress } = payload;
  const { dispatch, extra, getState } = thunkAPI;
  const { currentUser } = getState();
  const { tokenService, transactionService, analytics } = extra;

  const analyticsPayload = {
    ...payload,
    walletAddress: currentUser.selectedAddress,
  };
  (await analytics.get()).track("approve_token_init", analyticsPayload);

  const amount = extra.config.MAX_UINT256;
  const accountAddress = currentUser.selectedAddress;

  if (!accountAddress) {
    throw new Error("WALLET NOT CONNECTED");
  }

  try {
    await dispatch(changeWalletNetwork({ network })).unwrap();

    const tx = await tokenService.approve({
      network,
      // accountAddress, TODO remove
      tokenAddress,
      spenderAddress,
      amount,
    });
    console.log("📜 LOG > tokens/approve > tx", tx);
    (await analytics.get()).track("approve_token_approved", analyticsPayload);

    await transactionService.handleTransaction({ network, tx });

    return { amount };
  } catch (error) {
    console.log("📜 LOG > tokens/approve > error", error);
    if (error instanceof Error) {
      if (
        error.message ===
        "MetaMask Tx Signature: User denied transaction signature."
      ) {
        (await analytics.get()).track(
          "approve_token_rejected",
          analyticsPayload
        );
      }
      // TODO make sure this is caught by sentry
    }
    throw error;
  }
});

export const permit = createAsyncThunk<
  TokenApproveResult,
  TokenApproveParams,
  ThunkConfigShape
>("tokens/permit", async (payload, thunkAPI) => {
  const { network, tokenAddress, spenderAddress } = payload;
  const { dispatch, extra, getState } = thunkAPI;
  const { currentUser } = getState();
  const { tokenService, transactionService, analytics } = extra;

  const analyticsPayload = {
    ...payload,
    walletAddress: currentUser.selectedAddress,
  };
  (await analytics.get()).track("permit_token_init", analyticsPayload);

  const amount = extra.config.MAX_UINT256;
  const accountAddress = currentUser.selectedAddress;

  if (!accountAddress) {
    throw new Error("WALLET NOT CONNECTED");
  }

  try {
    await dispatch(changeWalletNetwork({ network })).unwrap();
    const tx = await tokenService.permit({
      network,
      // accountAddress, TODO remove
      tokenAddress,
      spenderAddress,
      amount,
      onSignSuccess: async () => {
        (await analytics.get()).track("permit_token_signed", analyticsPayload);
      },
    });
    console.log("📜 LOG > tokens/permit > tx", tx);

    await transactionService.handleTransaction({ network, tx });

    return { amount };
  } catch (error) {
    console.log("📜 LOG > tokens/permit > error", error);
    if (error instanceof Error) {
      if (
        error.message ===
        "MetaMask Message Signature: User denied message signature."
      ) {
        (await analytics.get()).track(
          "permit_token_rejected",
          analyticsPayload
        );
      }
      // TODO make sure this is caught by sentry
    }
    throw error;
  }
});

export const patchUserTokens = createAction<{
  network: NetworkName;
  userTokenMap: Record<string, string>;
}>("tokens/getUserTokens");

export const getUserTokens = createAsyncThunk<
  void,
  { network: NetworkName; addresses: string[] },
  ThunkConfigShape
>(
  "tokens/getUserTokens",
  async ({ network, addresses }, { extra, getState, dispatch }) => {
    const { currentUser } = getState();
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) throw new Error("WALLET NOT CONNECTED");

    const { tokenService } = extra;
    const userTokens = await tokenService.getUserTokensData({
      network,
      accountAddress,
      tokenAddresses: addresses,
    });

    const userTokenMap: Record<string, string> = {};
    for (const index in addresses) {
      userTokenMap[addresses[index].toLowerCase()] = userTokens[index];
    }

    dispatch(patchUserTokens({ network, userTokenMap }));
  }
);

export const getTokenAllowance = createAsyncThunk<
  any,
  { network: NetworkName; tokenAddress: string; spenderAddress: string },
  ThunkConfigShape
>(
  "tokens/getTokenAllowance",
  async ({ network, tokenAddress, spenderAddress }, { extra, getState }) => {
    const { currentUser } = getState();
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    const { tokenService } = extra;
    const allowance = await tokenService.getTokenAllowance({
      network,
      accountAddress,
      tokenAddress,
      spenderAddress,
    });
    return { allowance };
  }
);

export const tokenSlice = createSlice({
  name: "tokenSlice",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(approve.pending, (state, { meta }) => {
        const { network, tokenAddress } = meta.arg;
        state.user.userTokensActionsMap[network][tokenAddress] = {
          isApproving: true,
        };
      })
      .addCase(approve.fulfilled, (state, { meta, payload: { amount } }) => {
        const { network, tokenAddress, spenderAddress } = meta.arg;
        state.user.userTokensAllowancesMap[network][tokenAddress] = {
          ...state.user.userTokensAllowancesMap[network][tokenAddress],
          [spenderAddress]: amount,
        };
        state.user.userTokensActionsMap[network][tokenAddress] = {};
      })
      .addCase(approve.rejected, (state, { meta }) => {
        const { network, tokenAddress } = meta.arg;
        state.user.userTokensActionsMap[network][tokenAddress] = {};
      })
      .addCase(permit.pending, (state, { meta }) => {
        const { network, tokenAddress } = meta.arg;
        state.user.userTokensActionsMap[network][tokenAddress] = {
          isApproving: true,
        };
      })
      .addCase(permit.fulfilled, (state, { meta, payload: { amount } }) => {
        const { network, tokenAddress, spenderAddress } = meta.arg;
        state.user.userTokensAllowancesMap[network][tokenAddress] = {
          ...state.user.userTokensAllowancesMap[network][tokenAddress],
          [spenderAddress]: amount,
        };
        state.user.userTokensActionsMap[network][tokenAddress] = {};
      })
      .addCase(permit.rejected, (state, { meta }) => {
        const { network, tokenAddress } = meta.arg;
        state.user.userTokensActionsMap[network][tokenAddress] = {};
      })
      .addCase(
        patchUserTokens,
        (state, { payload: { network, userTokenMap } }) => {
          state.user.tokenBalances[network] = {
            ...state.user.tokenBalances[network],
            ...userTokenMap,
          };
        }
      )
      .addCase(
        getTokenAllowance.fulfilled,
        (state, { meta, payload: { allowance } }) => {
          const { network, tokenAddress, spenderAddress } = meta.arg;
          state.user.userTokensAllowancesMap[network][tokenAddress] = {
            ...state.user.userTokensAllowancesMap[network][tokenAddress],
            [spenderAddress]: allowance,
          };
        }
      );
  },
});

export const selectTokenBalance =
  (network?: NetworkName, address?: Address) => (state: RootState) => {
    if (!network || !address) return parseTokenBalance("0");

    return parseTokenBalance(
      state.token.user.tokenBalances[network][address.toLowerCase()]
    );
  };

export const parseTokenBalance = (tokenBalance?: string) =>
  ethers.BigNumber.from(tokenBalance ?? "0");

export default tokenSlice.reducer;
