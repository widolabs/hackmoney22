export function shortenWalletAddress(walletAddress) {
  return `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`;
}

export function isValidEmailAddress(str) {
  // from https://stackoverflow.com/questions/46155/whats-the-best-way-to-validate-an-email-address-in-javascript
  let re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(str.toLowerCase());
}

export function getTokensDetails(tokenIds, tokenListData) {
  let tokensDetails = [];

  tokenIds.forEach((tokenId) => {
    tokensDetails.push(tokenListData[tokenId]);
  });

  return tokensDetails;
}

export function getEmptyTokenObject() {
  return {
    address: undefined,
    chainId: undefined,
    decimals: undefined,
    logoURI: undefined,
    name: undefined,
    symbol: undefined,
  };
}

export function roundOff(x, decimalPlaces = 2) {
  return Math.round(x * 100) / 10 ** decimalPlaces;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop() {}

export function openLinkSafely(link) {
  window.open(link, "_blank", "noopener,noreferrer");
}
