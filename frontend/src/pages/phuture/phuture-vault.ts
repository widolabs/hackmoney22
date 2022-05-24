export default {
  // Phuture Finance PDI
  // https://develop.dtx8k9yf1fdra.amplifyapp.com/index/0xf9ccb834adbe4591fd517aa69a24bf97d1386092
  address: "0xf9cCb834aDBe4591Fd517Aa69A24BF97d1386092", // Vault contract address
  underlying_token_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Share token address
  display_name: "Phuture DeFi Index",
  symbol: "PDI", // Used in my balance
  decimals: 18, // Number of decimals in the vault ERC20 token
  provider: "phuture.finance", // Protocol Display name
  icon: [
    // One or two links to icons
    new URL("../../assets/phuture-pdi.png", import.meta.url).href,
  ],
  chain_id: 1338,
  details: {
    protocol: {
      name: "Phuture Finance", // Protocol webpage (read-friendly)
      link: "", // Protocol link
    },
  },
  deposit_token: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
  wido_together: ["Deposit", "Withdraw"],
};
