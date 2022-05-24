import Notify, { UpdateNotification } from "bnc-notify";

import config from "../../config";

const notify = Notify({
  dappId: config.BNC_ONBOARD.API_KEY,
  networkId: config.BNC_ONBOARD.NETWORK_ID,
});

export type { UpdateNotification };

export { notify };
