import { Middleware } from "@reduxjs/toolkit";

/**
 * Inspired by https://redux-toolkit.js.org/rtk-query/usage/error-handling#handling-errors-at-a-macro-level
 */
export function catchFailedActions(errorHandler): Middleware {
  return function (store) {
    return function (next) {
      return function (action) {
        if (action.error) {
          errorHandler(action.error, store.getState, action, store.dispatch);
        }
        return next(action);
      };
    };
  };
}
