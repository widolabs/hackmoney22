require("@nomiclabs/hardhat-waffle");
require("hardhat-contract-sizer");
require("hardhat-etherscan-abi");
require("hardhat-preprocessor");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-etherscan");
require("@tenderly/hardhat-tenderly");
require("dotenv").config();

const { removeConsoleLog } = require("hardhat-preprocessor");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // ===== Fantom Mainnet fork for testnet ====
    hardhat: {
      chainId: 1500,
      forking: {
        url: "https://nd-520-334-586.p2pify.com/3641909480ec9fe92eae77278079095d",
        blockNumber: 34081892,
      },
    },
    // ======== Hardhat fork for Mainnet ========
    // hardhat: {
    //     chainId: 1,
    //     forking: {
    //         url: "https://eth-mainnet.alchemyapi.io/v2/noz9bn6oi0lveG8xkoFjuwdWKd1w4ZjW",
    //         blockNumber: 14727882,
    //     },
    // },
    // ==========================================
    // ===== Hardhat fork for Fantom Mainnet ====
    // hardhat: {
    //     chainId: 250,
    //     forking: {
    //         url: "https://nd-520-334-586.p2pify.com/3641909480ec9fe92eae77278079095d",
    //         blockNumber: 34081892,
    //     },
    //     // mining: {
    //     //     auto: false,
    //     //     interval: [3000, 6000],
    //     // },
    // },
    // ===========================================
    // ===== Hardhat fork for Avalanche Mainnet ====
    // hardhat: {
    //     chainId: 43114,
    //     forking: {
    //         url: "https://speedy-nodes-nyc.moralis.io/865e9cfbaf08d996cab7981f/avalanche/mainnet",
    //         blockNumber: 14038123,
    //     },
    //     // mining: {
    //     //     auto: false,
    //     //     interval: [3000, 6000],
    //     // },
    // },
    // ===========================================
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/t5WroFwaKkniTDT-f4DePsLJHINCEgy2",
      accounts: [
        `0xf5495dbca431e91db5d76c60e5575411cf796a0e38ef5e6a23a5b1c5f1d5f74e`,
      ],
      gasMultiplier: 2,
      // gasPrice: 10000000000
    },
    goerli: {
      url: "https://goerli.infura.io/v3/2247229f0cd74ed2bf1fe48c3d5430ef",
      accounts: [process.env.GOERLI_PKEY],
      timeout: 120000,
    },
    mainnet: {
      url: "https://mainnet.infura.io/v3/2247229f0cd74ed2bf1fe48c3d5430ef",
      accounts: [process.env.MAINNET_PKEY],
      gasPrice: 20 * 1000000000,
      gasMultiplier: 1.2,
      timeout: 6000000,
    },
    fantomtest: {
      chainId: 4002,
      url: "https://rpc.testnet.fantom.network",
      accounts: [process.env.FANTOM_TESTNET_PKEY],
    },
    mumbai: {
      chainId: 80001,
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: [process.env.MUMBAI_TESTNET_PKEY],
      timeout: 600000,
    },
    fantom: {
      url: "https://nd-520-334-586.p2pify.com/3641909480ec9fe92eae77278079095d",
      gasPrice: 250 * 1000000000,
      gasMultiplier: 1.2,
      timeout: 600000,
      accounts: [process.env.FANTOM_PKEY],
    },
    avalanche: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 25 * 1000000000,
      gasMultiplier: 1.2,
      timeout: 600000,
      accounts: [process.env.AVALANCHE_PKEY],
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  preprocess: {
    eachLine: removeConsoleLog(
      (hre) =>
        hre.network.name !== "hardhat" && hre.network.name !== "localhost"
    ),
  },
};
