import { configureStore, AnyAction } from "@reduxjs/toolkit";
import { BlocknativeWallet } from "../frameworks/blocknative/Onboard";
import { EthersWeb3Provider } from "../frameworks/ethers";
import { TokenService } from "../services/TokenService";
import { TransactionService } from "../services/TransactionService";
import { WidoService } from "../services/WidoService";
import { widoApiSlice } from "./apiSlice";
import {
  currentUserSlice,
  CurrentUserState,
} from "./reducers/currentUserSlice";
import vaultReducer from "./reducers/vaultSlice";
import tokenSliceReducer from "./reducers/tokenSlice";
import appSliceReducer from "./reducers/appSlice";
import config from "../config";
import { BiconomyImpl } from "../frameworks/biconomy/Biconomy";
import tokenListSliceReducer from "./reducers/tokenListSlice";
import widoSliceReducer from "./reducers/widoSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import * as Sentry from "@sentry/react";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { defenderApiSlice } from "./defenderApiSlice";
import { coingeckoApiSlice } from "./coingeckoApiSlice";
import { notify } from "../frameworks/blocknative/Notify";
import { catchReducerErrors } from "./middleware/catch-reducer-errors";
import { catchFailedActions } from "./middleware/catch-failed-actions";
import { covalentApiSlice } from "./covalentApi.slice";
import AnalyticsService from "../frameworks/segment/AnalyticsService";

export type ThunkConfigShape = {
  extra: {
    analytics: typeof AnalyticsService;
    wallet: BlocknativeWallet;
    biconomy: BiconomyImpl;
    web3Provider: EthersWeb3Provider;
    widoService: WidoService;
    transactionService: TransactionService;
    tokenService: TokenService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notify: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: typeof config; // TODO: remove
  };
  dispatch: AppDispatch;
  state: RootState;
};

const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

const store = configureStore({
  reducer: {
    currentUser: persistReducer<CurrentUserState, AnyAction>(
      {
        key: currentUserSlice.name,
        storage,
        whitelist: ["preferredWallet"],
      },
      currentUserSlice.reducer
    ),
    vault: vaultReducer,
    token: tokenSliceReducer,
    tokenList: tokenListSliceReducer,
    wido: widoSliceReducer,
    app: appSliceReducer,
    [widoApiSlice.reducerPath]: widoApiSlice.reducer,
    [coingeckoApiSlice.reducerPath]: coingeckoApiSlice.reducer,
    [covalentApiSlice.reducerPath]: covalentApiSlice.reducer,
    [defenderApiSlice.reducerPath]: defenderApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    const web3Provider = new EthersWeb3Provider();
    const biconomy = new BiconomyImpl();
    const transactionService = new TransactionService({ web3Provider });
    const extraArgument = {
      analytics: AnalyticsService,
      wallet: new BlocknativeWallet(),
      notify,
      tokenService: new TokenService({
        transactionService,
        web3Provider,
        biconomy,
      }),
      web3Provider,
      config,
      biconomy,
      widoService: new WidoService({
        transactionService,
        web3Provider,
        biconomy,
      }),
      transactionService,
    };
    const middlewareOptions = {
      thunk: {
        extraArgument,
      },
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    };
    const middleware = getDefaultMiddleware(middlewareOptions);

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { createLogger } = require("redux-logger");
      const logger = createLogger({
        collapsed: (getState, action) =>
          new RegExp(
            ["api/", "coingeckoApi/", "persist/", "middlewareRegistered"].join(
              "|"
            )
          ).test(action.type),
      });

      middleware.push(logger);
    }

    middleware.push(
      catchReducerErrors((error) => {
        console.error(error);
        Sentry.captureException(error);
      })
    );
    middleware.push(
      catchFailedActions((errorObject, getState, action) => {
        if (["coingeckoApi/executeQuery/rejected"].includes(action.type)) {
          return;
        }
        if (
          errorObject.message ===
          "Aborted due to condition callback returning false."
        ) {
          return;
        }
        // create a native Error object for sentry
        const error = new Error(errorObject.message);
        error.name = errorObject.name;
        error.stack = errorObject.stack;
        console.error(error);
        Sentry.captureException(error);
      })
    );

    return middleware
      .concat(widoApiSlice.middleware)
      .concat(coingeckoApiSlice.middleware)
      .concat(covalentApiSlice.middleware)
      .concat(defenderApiSlice.middleware);
  },
  enhancers: [sentryReduxEnhancer],
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
