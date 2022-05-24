/**
 * https://github.com/PlatziDev/redux-catch
 */
export function catchReducerErrors(errorHandler) {
  return function (store) {
    return function (next) {
      return function (action) {
        try {
          return next(action);
        } catch (err) {
          errorHandler(err, store.getState, action, store.dispatch);
          return err;
        }
      };
    };
  };
}
