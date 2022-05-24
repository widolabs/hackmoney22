import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { widoApiSlice } from "../apiSlice";
import config from "../../config";
import { getNetworkId } from "../../utils/network";
import { changeWalletNetwork } from "./currentUserSlice";
import { defenderApiSlice } from "../defenderApiSlice";
import { ThunkConfigShape } from "../store";

export type NetworkName =
  | "mainnet"
  | "fantom"
  | "avalanche"
  | "moonriver"
  | "polygon"
  | "arbitrum"
  | "celo"
  | "goerli"
  | "phuture"
  | "other";

type BatchWithdrawParams = {
  network: NetworkName;
  vaultAddress: string;
  tokenAddress: string;
  amount: string;
};

export const batchWithdraw = createAsyncThunk<
  void,
  BatchWithdrawParams,
  ThunkConfigShape
>(
  "wido/batchWithdraw",
  async ({ network, vaultAddress, tokenAddress, amount }, thunkAPI) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    await dispatch(changeWalletNetwork({ network })).unwrap();

    const { message, signature } = await widoService.batchWithdraw({
      network,
      vaultAddress,
      tokenAddress,
      amount,
    });

    await dispatch(
      widoApiSlice.endpoints.addToVaultWithdrawalQueue.initiate({
        withdraw: message,
        signature,
        debug: config.DEBUG,
      })
    );
  }
);

type BatchDepositParams = {
  network: NetworkName;
  vaultAddress: string;
  tokenAddress: string;
  amount: string;
};

export const batchDeposit = createAsyncThunk<
  void,
  BatchDepositParams,
  ThunkConfigShape
>(
  "wido/batchDeposit",
  async ({ network, vaultAddress, tokenAddress, amount }, thunkAPI) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    await dispatch(changeWalletNetwork({ network })).unwrap();

    const { message, signature } = await widoService.batchDeposit({
      network,
      vaultAddress,
      tokenAddress,
      amount,
    });

    await dispatch(
      widoApiSlice.endpoints.addToVaultDepositQueue.initiate({
        deposit: message,
        signature,
        chain_id: getNetworkId(network),
        debug: config.DEBUG,
      })
    );
  }
);

type BatchSwapParams = {
  network: NetworkName;
  fromVaultAddress: string;
  toVaultAddress: string;
  amount: string;
};

export const batchSwap = createAsyncThunk<
  void,
  BatchSwapParams,
  ThunkConfigShape
>(
  "wido/batchSwap",
  async ({ network, fromVaultAddress, toVaultAddress, amount }, thunkAPI) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    await dispatch(changeWalletNetwork({ network })).unwrap();

    const { message, signature } = await widoService.batchSwap({
      network,
      fromVaultAddress,
      toVaultAddress,
      amount,
    });

    await dispatch(
      widoApiSlice.endpoints.addToVaultSwapQueue.initiate({
        swap: message,
        signature,
        debug: config.DEBUG,
      })
    );
  }
);

type GaslessOrderParams = {
  network: NetworkName;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  onTxHash: (txHash: string) => void;
};

export const gaslessOrder = createAsyncThunk<
  void,
  GaslessOrderParams,
  ThunkConfigShape
>(
  "wido/gaslessOrder",
  async (
    { network, fromTokenAddress, toTokenAddress, amount, onTxHash },
    thunkAPI
  ) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService, transactionService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    await dispatch(changeWalletNetwork({ network })).unwrap();

    const swapRouteResponse = await dispatch(
      widoApiSlice.endpoints.fetchSwapRoute.initiate(
        {
          chainId: getNetworkId(network),
          fromTokenAddress,
          toTokenAddress,
          amount,
        },
        { forceRefetch: true }
      )
    );

    const { swapRoute, minToTokenAmount } = swapRouteResponse.data;

    // TODO: Don't ask for signature if fetchSwap returns error.

    const { message, signature } = await widoService.gaslessOrder({
      network,
      fromTokenAddress,
      toTokenAddress,
      fromTokenAmount: amount,
      minToTokenAmount,
    });

    const addToOrderFuturePromise = dispatch(
      widoApiSlice.endpoints.addToOrder.initiate({
        order: message,
        signature,
        debug: config.DEBUG,
      })
    );

    // TODO: Enable this when Biconomy fixes its issue
    // const tx = await widoService.executeOrder({
    //   network,
    //   userAddress,
    //   message,
    //   signature,
    //   swapRoute: swapRoute,
    // });

    let tx;
    if (!config.DEBUG) {
      const txHash = await dispatch(
        defenderApiSlice.endpoints.sendMetaTx.initiate({
          network,
          order: message,
          signature,
          swapRoute: swapRoute,
        })
      ).unwrap();
      tx = { hash: txHash };
    } else {
      tx = await widoService.executeOrderLocalEnv({
        network,
        message,
        signature,
        swapRoute,
      });
    }

    if (onTxHash) onTxHash(tx.hash);
    console.log("📜 LOG > wido/gaslessOrder > tx", tx);

    await transactionService.handleTransaction({ network, tx });
    await addToOrderFuturePromise;

    return tx;
  }
);

type CrossChainOrderParams = {
  fromNetwork: NetworkName;
  fromTokenAddress: string;
  toNetwork: NetworkName;
  toTokenAddress: string;
  amount: string;
  onTxHash: (txHash: string) => void;
};

export const estimateGasFee = createAsyncThunk<
  string,
  Omit<CrossChainOrderParams, "onTxHash">,
  ThunkConfigShape
>(
  "wido/estimateGasFee",
  async (
    { fromNetwork, fromTokenAddress, toNetwork, toTokenAddress, amount },
    thunkAPI
  ) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    const swapRouteResponse = await dispatch(
      widoApiSlice.endpoints.fetchCrossChainSwapRoute.initiate(
        {
          user: accountAddress,
          fromChainId: getNetworkId(fromNetwork),
          fromTokenAddress,
          toChainId: getNetworkId(toNetwork),
          toTokenAddress,
          amount,
        },
        { forceRefetch: true }
      )
    );
    console.log("📜 LOG > swapRouteResponse", swapRouteResponse);
    if (swapRouteResponse.isError) return;

    const { srcSwapRoute, dstSwapRoute, bridgeOptions } =
      swapRouteResponse.data;

    const order = {
      user: accountAddress,
      fromToken: fromTokenAddress,
      fromChainId: getNetworkId(fromNetwork),
      toToken: toTokenAddress,
      toChainId: getNetworkId(toNetwork),
      fromTokenAmount: amount,
      minToTokenAmount: 0,
      nonce: 0,
      expiration: 0,
    };

    const lzFee = await widoService.getLzFees(
      fromNetwork,
      toNetwork,
      order,
      dstSwapRoute,
      bridgeOptions
    );
    console.log("📜 LOG > lzFee", lzFee);
    return lzFee.toString();
  }
);

export const crossChainOrder = createAsyncThunk<
  void,
  CrossChainOrderParams,
  ThunkConfigShape
>(
  "wido/crossChainOrder",
  async (
    {
      fromNetwork,
      fromTokenAddress,
      toNetwork,
      toTokenAddress,
      amount,
      onTxHash,
    },
    thunkAPI
  ) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { currentUser } = getState();
    const { widoService, transactionService } = extra;
    const accountAddress = currentUser.selectedAddress;
    if (!accountAddress) {
      throw new Error("WALLET NOT CONNECTED");
    }

    await dispatch(changeWalletNetwork({ network: fromNetwork })).unwrap();

    const swapRouteResponse = await dispatch(
      widoApiSlice.endpoints.fetchCrossChainSwapRoute.initiate(
        {
          user: accountAddress,
          fromChainId: getNetworkId(fromNetwork),
          fromTokenAddress,
          toChainId: getNetworkId(toNetwork),
          toTokenAddress,
          amount,
        },
        { forceRefetch: true }
      )
    );

    const { srcSwapRoute, dstSwapRoute, bridgeOptions } =
      swapRouteResponse.data;

    // TODO: Don't proceed with tx if fetchSwap returns error.

    const tx = await widoService.executeCrossChainOrder({
      user: accountAddress,
      fromTokenAddress,
      fromNetwork,
      toTokenAddress,
      toNetwork,
      fromTokenAmount: amount,
      minToTokenAmount: 0, // TODO: This needs to come from swapRoute api
      srcSwapRoute,
      dstSwapRoute,
      bridgeOptions,
    });

    if (onTxHash) onTxHash(tx.hash);
    console.log("📜 LOG > wido/crossChainOrder > tx", tx);

    await transactionService.handleTransaction({ network: fromNetwork, tx });

    return tx;
  }
);

type WidoState = {
  user: {
    userActionsMap: {
      isSigning: boolean;
    };
  };
};

export const initialState: WidoState = {
  user: {
    userActionsMap: {
      isSigning: false,
    },
  },
};

export const widoSlice = createSlice({
  name: "widoSlice",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(gaslessOrder.pending, (state) => {
        state.user.userActionsMap.isSigning = true;
      })
      .addCase(gaslessOrder.fulfilled, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(gaslessOrder.rejected, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchWithdraw.pending, (state) => {
        state.user.userActionsMap.isSigning = true;
      })
      .addCase(batchWithdraw.fulfilled, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchWithdraw.rejected, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchDeposit.pending, (state) => {
        state.user.userActionsMap.isSigning = true;
      })
      .addCase(batchDeposit.fulfilled, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchDeposit.rejected, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchSwap.pending, (state) => {
        state.user.userActionsMap.isSigning = true;
      })
      .addCase(batchSwap.fulfilled, (state) => {
        state.user.userActionsMap.isSigning = false;
      })
      .addCase(batchSwap.rejected, (state) => {
        state.user.userActionsMap.isSigning = false;
      });
  },
});

export default widoSlice.reducer;
