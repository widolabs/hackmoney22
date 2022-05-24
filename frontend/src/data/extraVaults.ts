import { Vault, VaultDetails, HistoricalAPYRaw } from "../state/apiSlice";

type ExtraDataVault = Vault & {
  details: VaultDetails;
  historical: HistoricalAPYRaw[];
};

type ExtraVaultsType = {
  entities: ExtraDataVault[];
};

type ExtraHistoricalDataType = {
  timestamp: number; // 21th April 2022 8:20 CET
  date: string;
  net_apy: number;
  tvl: number; // in USD
  total_assets: number;
};

const generateExtraHistoricalData = function (
  historicalDataList
): ExtraHistoricalDataType[] {
  const extraHistoricalData: ExtraHistoricalDataType[] = [];

  for (const historicalDataItem of historicalDataList) {
    extraHistoricalData.push({
      ...historicalDataItem,
      total_assets: 0,
    });
  }

  return extraHistoricalData;
};

const generateExtraVaultsData = function (vaultsData): ExtraDataVault[] {
  const extraVaultsData: ExtraDataVault[] = [];

  for (const vaultData of vaultsData) {
    extraVaultsData.push({
      ...vaultData,
      apy: vaultData.historical[vaultData.historical.length - 1].net_apy,
      tvl: {
        tvl_in_token: 0,
        tvl_in_usd: vaultData.historical[vaultData.historical.length - 1].tvl,
      },
      // version: "0",
      // raw_data: {}, // Empty object
      pegged_token: ["USD"], // Do not change
      wido_together: vaultData.wido_together ?? [], // Since they are read only, we can just leave this empty

      details: {
        ...vaultData.details,
        address: vaultData.address,
        entity_inception_timestamp: 0,

        chain_id: vaultData.chain_id,

        pnl_sim_token: vaultData.pnl_sim_token ?? [],
        deposit_token: vaultData.deposit_token ?? [],
        fees: [],

        protocol: {
          ...vaultData.details.protocol,
        },

        strategy_info: "",
        migration_address: "",
      },
    });
  }

  return extraVaultsData;
};

const extraVaults: ExtraVaultsType = {
  entities: generateExtraVaultsData([
    // {
    //   // Spirit fUSDT/BUSD by Tarot on Fantom
    //   // https://www.tarot.to/lending-pool/250/0xd837e86c951dd98b80195deb39e4166c485efff3
    //   // read data for BUSD
    //   address: "0xd837e86c951dd98b80195deb39e4166c485efff3", // Spirit fUSDT/BUSD by Tarot on Fantom
    //   underlying_token_address: "0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50", // Contract address of the deposit token
    //   display_name: "Spirit fUSDT/BUSD",
    //   symbol: "vTAROT",
    //   decimals: 18, // Number of decimals in the vault ERC20 token
    //   provider: "Tarot",
    //   icon: [
    //     "https://www.tarot.to/assets/images/token-icons/0x049d68029688eAbF473097a2fC38ef61633A3C7A.png",
    //     "https://www.tarot.to/assets/images/token-icons/0xC931f61B1534EB21D8c11B24f3f5Ab2471d4aB50.png",
    //   ],
    //   chain_id: 250,
    //   base_token: [
    //     "0xc931f61b1534eb21d8c11b24f3f5ab2471d4ab50",
    //     "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    //   ],
    //   details: {
    //     protocol: {
    //       name: "tarot.to",
    //       link: "https://www.tarot.to/",
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 1650460348, // 20th April 2022 14:40 CET
    //       date: "2022/04/20",
    //       net_apy: 0.2912,
    //       tvl: 20182, // in USD
    //     },
    //     {
    //       timestamp: 1650521985, // 21th April 2022 8:20 CET
    //       date: "2022/04/21",
    //       net_apy: 0.2849,
    //       tvl: 20115, // in USD
    //     },
    //     {
    //       timestamp: 1650625865, // 22nd April 2022 13:10 CET
    //       date: "2022/04/22",
    //       net_apy: 0.3406,
    //       tvl: 20140, // in USD
    //     },
    //     {
    //       timestamp: 1650697689, // 24nd April 2022 11:05 CET
    //       date: "2022/04/23",
    //       net_apy: 0.1726,
    //       tvl: 39249, // in USD
    //     },
    //     {
    //       timestamp: 1650784089, // 24nd April 2022 11:05 CET
    //       date: "2022/04/24",
    //       net_apy: 0.1606,
    //       tvl: 40927, // in USD
    //     },
    //     {
    //       timestamp: 1650877689, // 25nd April 2022 11:05 CET
    //       date: "2022/04/25",
    //       net_apy: 0.2106,
    //       tvl: 22140, // in USD
    //     },
    //     {
    //       timestamp: 1650950733, // 26nd April 2022 5:25 GMT
    //       date: "2022/04/26",
    //       net_apy: 0.0712,
    //       tvl: 37000, // in USD
    //     },
    //   ]),
    // },
    // AAVE UST on Ethereum
    // {
    //   // {vault name}
    //   // {vault url}
    //   // {manual scraping instructions}
    //   address: "0xa8De3e3c934e2A1BB08B010104CcaBBD4D6293ab", // The deposit is represented by aUST
    //   underlying_token_address: "0xa693B19d2931d498c5B318dF961919BB4aee87a5", // UST is what you deposit into this vault
    //   display_name: "UST",
    //   symbol: "aUST", // Used in my balance
    //   decimals: 6, // Number of decimals in the vault ERC20 token
    //   provider: "Aave", // Protocol Display name
    //   icon: [
    //     // One or two links to icons
    //     "https://app.aave.com/icons/tokens/ust.svg",
    //   ],
    //   chain_id: 1,
    //   base_token: ["0xa693B19d2931d498c5B318dF961919BB4aee87a5"],
    //   details: {
    //     protocol: {
    //       name: "app.aave.com", // Protocol webpage (read-friendly)
    //       link: "https://app.aave.com/reserve-overview/?underlyingAsset=0xa693b19d2931d498c5b318df961919bb4aee87a5&marketName=proto_mainnet", // Protocol link
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 1650541903, // Unix timestamp
    //       date: "2022/04/21", // "YYYY/MM/DD"
    //       net_apy: 0.1334, // 0.123 = 12.3%
    //       tvl: 10852972, // in USD
    //     },
    //   ]),
    // },
    // RUSD; Rose.fi on Fantom
    // Rewards in ROSE
    // {
    //   // {RoseRUSDLP}
    //   // {https://app.rose.fi/#/farms/rusd}
    //   // {manual scraping instructions}
    //   address: "", // Vault contract address
    //   underlying_token_address: "0x56f87a0cB4713eB513BAf57D5E81750433F5fcB9", // Share token address
    //   display_name: "",
    //   symbol: "", // Used in my balance
    //   decimals: 18, // Number of decimals in the vault ERC20 token
    //   provider: "", // Protocol Display name
    //   icon: [
    //     // One or two links to icons
    //     "",
    //   ],
    //   chain_id: 0,
    //   base_token: [""],
    //   details: {
    //     protocol: {
    //       name: "", // Protocol webpage (read-friendly)
    //       link: "", // Protocol link
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 0, // Unix timestamp
    //       date: "", // "YYYY/MM/DD"
    //       net_apy: 0, // 0.123 = 12.3%
    //       tvl: 0, // in USD
    //     },
    //   ]),
    // },
    // [BOO] rewards are needed
    // {
    //   // SpookySwap USDC-MAI
    //   // Coindix is reporting 20.3% APY + 2.32% rewards in BOO
    //   // Spooky's website is telling a different story
    //   // I reached out to Spooky's Telegram and asked details about their APR
    //   // https://spookyswap.finance/farms
    //   // {manual scraping instructions}
    //   address: "", // Vault contract address
    //   underlying_token_address: "", // Share token address
    //   display_name: "USDC-MAI",
    //   symbol: "", // Used in my balance
    //   decimals: 18, // Number of decimals in the vault ERC20 token
    //   provider: "", // Protocol Display name
    //   icon: [
    //     // One or two links to icons
    //     "",
    //   ],
    //   chain_id: 0,
    //   base_token: [""],
    //   details: {
    //     protocol: {
    //       name: "", // Protocol webpage (read-friendly)
    //       link: "", // Protocol link
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 1650540997, // Unix Timestamp
    //       date: "2022/04/21", // "YYYY/MM/DD"
    //       net_apy: 0.1044,
    //       tvl: 34347880, // in USD
    //       // TODO: rewards in BOO
    //     },
    //   ]),
    // },
    // SCREAM rewards are needed
    // {
    // Scream USDC on coindix reporting 11.5% + rewards in SCREAM
    // Unsure about this from Scream's UI
    // Reached out to Scream and asked about their inputs
    //   // {Scream USDC}
    //   // https://scream.sh/lend
    //   // {manual scraping instructions}
    //   address: "", // Vault contract address
    //   underlying_token_address: "", // Share token address
    //   display_name: "",
    //   symbol: "", // Used in my balance
    //   decimals: 18, // Number of decimals in the vault ERC20 token
    //   provider: "", // Protocol Display name
    //   icon: [
    //     // One or two links to icons
    //     "",
    //   ],
    //   chain_id: 0,
    //   base_token: [""],
    //   details: {
    //     protocol: {
    //       name: "", // Protocol webpage (read-friendly)
    //       link: "", // Protocol link
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 0, // Unix timestamp
    //       date: "", // "YYYY/MM/DD"
    //       net_apy: 0, // 0.123 = 12.3%
    //       tvl: 0, // in USD
    //     },
    //   ]),
    // },
    // TEMPLATE - DO NOT CHANGE
    // {
    //   // {vault name}
    //   // {vault url}
    //   // {manual scraping instructions}
    //   address: "", // Vault contract address
    //   underlying_token_address: "", // Share token address
    //   display_name: "",
    //   symbol: "", // Used in my balance
    //   decimals: 18, // Number of decimals in the vault ERC20 token
    //   provider: "", // Protocol Display name
    //   icon: [
    //     // One or two links to icons
    //     "",
    //   ],
    //   chain_id: 0,
    //   base_token: [""],
    //   details: {
    //     protocol: {
    //       name: "", // Protocol webpage (read-friendly)
    //       link: "", // Protocol link
    //     },
    //   },
    //   historical: generateExtraHistoricalData([
    //     {
    //       timestamp: 0, // Unix timestamp
    //       date: "", // "YYYY/MM/DD"
    //       net_apy: 0, // 0.123 = 12.3%
    //       tvl: 0, // in USD
    //     },
    //   ]),
    // },
  ]),
};

export default extraVaults;
