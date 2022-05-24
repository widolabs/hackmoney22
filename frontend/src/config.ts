const CONFIG = {
  WIDO_API_URL: "https://api.joinwido.com",
  BNC_ONBOARD: {
    API_KEY: "",
    NETWORK_ID: 1, // mainnet ETH
  },
  BICONOMY_API_KEY: {
    goerli: "",
    fantom: "",
    avalanche: "",
  },
  STARGATE_CHAIN_ID: {
    fantom: 12,
    avalanche: 6,
  },
  UX: {
    VAULTS_PER_PAGE: 10,
    TAB_INDEX: {
      IMPORTANT: 5,
    },
  },
  WIDO_CONTRACTS: {
    mainnet: {
      DEPOSIT: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      WITHDRAW: "0xeC551adFd927a0a2FB680e984B452516a7B2cCbc",
      SWAP: "0x926D47CBf3ED22872F8678d050e70b198bAE1559",
      CROSS_CHAIN_ORDER: "0xB8F77519cD414CB1849e4b7B4824183629F6B239",
    },
    fantom: {
      // The contract for ORDER, DEPOSIT and WITHDRAW should be the same.
      ORDER: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      DEPOSIT: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      WITHDRAW: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      CROSS_CHAIN_ORDER: "0x17C794cA661bC52F9673a65818d0FB15DBb049d0",
    },
    avalanche: {
      // The contract for ORDER, DEPOSIT and WITHDRAW should be the same.
      ORDER: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      DEPOSIT: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      WITHDRAW: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      CROSS_CHAIN_ORDER: "0x5873e3726B5AFDEB7C5fc46D8b79527c5b30Ad90",
    },
    moonriver: {
      // TODO: update contract address once deployed on Moonriver
      // The contract for ORDER, DEPOSIT and WITHDRAW should be the same.
      ORDER: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      DEPOSIT: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      WITHDRAW: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
    },
    celo: {
      // TODO: update contract address once deployed on Celo
      // The contract for ORDER, DEPOSIT and WITHDRAW should be the same.
      ORDER: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      DEPOSIT: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
      WITHDRAW: "0x7Bbd6348db83C2fb3633Eebb70367E1AEc258764",
    },
    phuture: {
      DEPOSIT: "0xf1d2b3A3a3E373c2417162E465467D09d75054f0",
      WITHDRAW: "0xeC551adFd927a0a2FB680e984B452516a7B2cCbc",
      SWAP: "0x926D47CBf3ED22872F8678d050e70b198bAE1559",
    },
  },
  NETWORK_SETTINGS: {
    mainnet: {
      id: "mainnet",
      name: "Ethereum",
      nativeCurrency: {
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
      },
      blockExplorerUrl: "https://etherscan.io",
      networkId: 1,
      rpcUrl:
        "https://eth-mainnet.alchemyapi.io/v2/noz9bn6oi0lveG8xkoFjuwdWKd1w4ZjW",
      notifyEnabled: true,
      txConfirmations: 1,
      permitEnabledTokens: [] as string[],
    },
    fantom: {
      id: "fantom",
      name: "Fantom",
      nativeCurrency: {
        name: "Fantom",
        symbol: "FTM",
        decimals: 18,
      },
      blockExplorerUrl: "https://ftmscan.com",
      networkId: 250,
      rpcUrl: "https://rpc.ftm.tools",
      notifyEnabled: false,
      txConfirmations: 2,
      permitEnabledTokens: ["0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"],
    },
    avalanche: {
      id: "avax",
      name: "Avalanche",
      nativeCurrency: {
        name: "Avalanche",
        symbol: "AVAX",
        decimals: 18,
      },
      blockExplorerUrl: "https://snowtrace.io",
      networkId: 43114,
      rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
      notifyEnabled: false,
      txConfirmations: 2,
      permitEnabledTokens: ["0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"],
    },
    moonriver: {
      id: "movr",
      name: "Moonriver",
      nativeCurrency: {
        name: "Movr",
        symbol: "MOVR",
        decimals: 18,
      },
      blockExplorerUrl: "https://moonriver.moonscan.io",
      networkId: 1285,
      rpcUrl: "https://rpc.api.moonriver.moonbeam.network",
      notifyEnabled: false,
      txConfirmations: 2,
      permitEnabledTokens: [""],
    },
    polygon: {
      id: "polygon",
      name: "Polygon",
      nativeCurrency: {
        name: "Matic",
        symbol: "MATIC",
        decimals: 18,
      },
      blockExplorerUrl: "https://polygonscan.com/",
      networkId: 137,
      rpcUrl: "https://polygon-rpc.com",
      notifyEnabled: false,
      txConfirmations: 2,
      permitEnabledTokens: [""],
    },
    celo: {
      id: "celo",
      name: "Celo",
      nativeCurrency: {
        name: "Celo",
        symbol: "CELO",
        decimals: 18,
      },
      blockExplorerUrl: "https://explorer.celo.org/",
      networkId: 42220,
      rpcUrl: "https://forno.celo.org",
      notifyEnabled: false,
      txConfirmations: 2,
      permitEnabledTokens: [""],
    },
  },
  MAX_UINT256:
    "115792089237316195423570985008687907853269984665640564039457584007913129639935",
  DEBUG: process.env.NODE_ENV === "development",
};

export default CONFIG;
