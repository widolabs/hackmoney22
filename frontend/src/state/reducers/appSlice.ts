import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { widoApiSlice } from "../apiSlice";
import { ThunkConfigShape } from "../store";
import { walletSetup } from "./currentUserSlice";

export const initApp = createAsyncThunk<void, void, ThunkConfigShape>(
  "app/initApp",
  async (_, thunkAPI) => {
    // TODO: Get user's wallet and network
    const { dispatch, extra, getState } = thunkAPI;
    const { analytics } = extra;

    // https://github.com/widolabs/wido-webapp/pull/117#discussion_r855372828
    analytics.get().then((instance) => {
      instance.identify();
    });

    dispatch(walletSetup());

    // TODO: We need to keep data fetching lean. This action blocks rendering of
    // screen.
    await Promise.all([
      dispatch(widoApiSlice.endpoints.fetchVaults.initiate()),
      dispatch(widoApiSlice.endpoints.fetchTokenList.initiate()),
    ]);

    const { selectedAddress } = getState().currentUser;

    if (selectedAddress) {
      analytics.get().then((instance) => {
        instance.track("connect_wallet", {
          address: selectedAddress,
          source: "auto_connect",
        });
      });
    }

    dispatch(appInitialized(true));
  }
);

type AppState = {
  isAppInitialized: boolean;
  menuOpen: boolean;
  pagesVisited: string[];
};

const initialState: AppState = {
  isAppInitialized: false,
  menuOpen: false,
  pagesVisited: [],
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    appInitialized: (state, action: PayloadAction<boolean>) => {
      state.isAppInitialized = action.payload;
    },
    toggleMenu: (state) => {
      state.menuOpen = !state.menuOpen;
    },
    newPageVisited(state, action: PayloadAction<string>) {
      state.pagesVisited.push(action.payload);
    },
  },
});

export const { appInitialized, toggleMenu, newPageVisited } = appSlice.actions;

export default appSlice.reducer;
