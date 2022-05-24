import { createAction, createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEthersProvider } from "../../frameworks/ethers";
import { getNetwork } from "../../utils/network";
import { ThunkConfigShape } from "../store";
import { noop } from "../../utils/utils";

const WALLET_AUTO_CONNECT_TIMEOUT = 5 * 1000;

const initialState: CurrentUserState = {
  isConnected: false,
  isLoading: true,
};

export type CurrentUserState = {
  selectedAddress?: string;
  preferredWallet?: string;
  addressEnsName?: string;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
};

const addressChange = createAction<{ address: string }>("wallet/addressChange");
const setPreferredWallet = createAction<string>("wallet/setPreferredWallet");

export const walletSelect = createAsyncThunk<
  void,
  { source: string },
  ThunkConfigShape
>("wallet/walletSelect", async ({ source }, thunkAPI) => {
  const { extra, getState } = thunkAPI;
  const { wallet, analytics } = extra;

  if (wallet.isCreated) {
    await wallet.connect();
    const selectedAddress = getState().currentUser.selectedAddress;
    if (selectedAddress) {
      (await analytics.get()).track("connect_wallet", {
        address: selectedAddress,
        source,
      });
    }
  }
});

export const walletSetup = createAsyncThunk<void, void, ThunkConfigShape>(
  "wallet/setup",
  async (_, thunkAPI) => {
    const { dispatch, extra, getState } = thunkAPI;
    const { biconomy, wallet, web3Provider, analytics } = extra;

    if (!wallet.isCreated) {
      wallet.create({
        wallet: (wallet) => {
          if (!wallet.provider) return;
          web3Provider.register("wallet", getEthersProvider(wallet.provider));
        },
        network: (network) => {
          console.log("📜 LOG > network", network);
          biconomy.create(
            getNetwork(network),
            web3Provider.getInstanceOf("wallet")
          );
        },
        address: async (address) => {
          console.log("📜 LOG > address", address);
          const walletName = wallet?.onboard?.getState()?.wallet?.name;
          if (walletName) dispatch(setPreferredWallet(walletName));
          dispatch(addressChange({ address }));
          (await analytics.get()).identify({ walletAddress: address });
        },
        balance: (balance) => {
          console.log("📜 LOG > balance", balance);
        },
      });
    }

    const { preferredWallet } = getState().currentUser;

    if (preferredWallet) {
      // wallet auto connecting, we are doing this in the background
      // so we must undo what onboard is doing
      // https://github.com/blocknative/web3-onboard/blob/v1-onboard/src/views/WalletSelect.svelte#L97
      window.document.body.classList.add("wallet-auto-connect");
      const originalScrollTo = window.scrollTo;
      window.scrollTo = noop;
      // after 5 seconds we will close the modal, assuming it has errored
      setTimeout(() => {
        const closeButton = window.document.querySelector(
          ".bn-onboard-modal-content-close"
        ) as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }, WALLET_AUTO_CONNECT_TIMEOUT);
      //
      await wallet.connect(preferredWallet);
      //
      window.document.body.classList.remove("wallet-auto-connect");
      window.scrollTo = originalScrollTo;
    }
  }
);

export const walletDisconnect = createAsyncThunk<void, void, ThunkConfigShape>(
  "wallet/walletDisconnect",
  async (_, thunkAPI) => {
    const { extra } = thunkAPI;
    const { wallet } = extra;

    wallet.disconnect();
  }
);

export const changeWalletNetwork = createAsyncThunk<
  void,
  { network: string },
  ThunkConfigShape
>("wallet/changeWalletNetwork", async ({ network }, { extra }) => {
  const { config, wallet, notify } = extra;

  let networkChanged = false;
  if (wallet.isCreated && wallet.changeNetwork) {
    networkChanged = await wallet.changeNetwork(network);
  }
  if (networkChanged) {
    const { NETWORK_SETTINGS } = config;
    const networkSettings = NETWORK_SETTINGS[network];
    const { networkId } = networkSettings;
    notify.config({ networkId });
  }

  if (!networkChanged) {
    throw new Error("Failed to change the network.");
  }
});

export const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addressChange, (state, { payload }) => {
        const { address } = payload;
        state.selectedAddress = address;
        state.isConnected = !!address;
      })
      .addCase(setPreferredWallet, (state, { payload }) => {
        state.preferredWallet = payload;
      })
      .addCase(walletSelect.pending, (state) => {
        state.isLoading = true;
        delete state.error;
      })
      .addCase(walletSetup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(walletSetup.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(walletSelect.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(walletSelect.rejected, (state, { error }) => {
        state.isLoading = false;
        state.error = error.message;
      })
      .addCase(walletDisconnect.fulfilled, (state) => {
        state.isConnected = false;
        delete state.selectedAddress;
        delete state.preferredWallet;
      });
  },
});
