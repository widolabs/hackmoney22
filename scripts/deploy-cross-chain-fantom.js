const { upgrades } = require("hardhat");
const hre = require("hardhat");
const utils = require("../test/test-utils");

async function main() {
    const CHAIN_ID = 250;
    const STARGATE_ROUTER = "0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6";

    const WidoRouter = await ethers.getContractFactory("WidoRouter");
    const WidoReceiver = await ethers.getContractFactory("WidoReceiver");

    // const wido = await upgrades.deployProxy(WidoRouter, [
    //     CHAIN_ID,
    //     STARGATE_ROUTER,
    // ]);
    // await wido.deployed();
    const wido = WidoRouter.attach(
        "0x17C794cA661bC52F9673a65818d0FB15DBb049d0"
    );

    // const widoReceiver = await upgrades.deployProxy(WidoReceiver, [
    //     wido.address,
    //     STARGATE_ROUTER,
    // ]);
    // await widoReceiver.deployed();
    const widoReceiver = WidoReceiver.attach(
        "0xF11b2365E8E5E7cA3E3155a068aC7A8b7e92ea79"
    );

    console.log("WidoRouter deployed to:", wido.address);
    console.log("WidoReceiver deployed to:", widoReceiver.address);

    // console.log("Now add stargate chain id...");
    // const stargateChainIdByNetworkChainId = {
    //     250: 12,
    //     43114: 6,
    //     1: 1,
    // };

    // for (const chainId in stargateChainIdByNetworkChainId) {
    //     await wido.functions.setStargateChainId(
    //         chainId,
    //         stargateChainIdByNetworkChainId[chainId]
    //     );
    // }

    console.log("Now added approved swap addresses...");
    const approveSwapAddresses = [
        // "0xDEF189DeAEF76E379df891899eb5A00a94cBC250", // 0x
        // "0x1b48641D8251c3E84ecbe3f2bD76B3701401906D", // DOLA
        // "0x0A0b23D9786963DE69CB2447dC125c49929419d8", // Yearn MIM Vault
        // "0x357ca46da26E1EefC195287ce9D838A6D5023ef3", // FRAX
        // "0xEF0210eB96c7EB36AF8ed1c20306462764935607", // USDC
        // "0x148c05caf1Bb09B5670f00D511718f733C54bC4c", // f-USDT
        // "0x637eC617c86D24E421328e6CAEa1d92114892439", // DAI
        // "0x21371d119bD22917eE2bd05497aE24d0CA3eE8F6", // Beefy Wigo
        // "0x8afc0f9bdc5dca9f0408df03a03520bfa98a15af", // Beefy Spooky
        // "0xFA884e17f04341542790453b1B9A0e6F587768ce", // Beefy Sushi
        // "0xb8EddAA94BB8AbF8A5BB90c217D53960242e104D",
        // "0x42ECfA11Db08FB3Bb0AAf722857be56FA8E57Dc0",
        // "0x897a1B6F3a2C3D2CB3137888F310Ecdc752bfcFB",
        // "0x074A2a6d0fdbf6860033E57eBD37Aeb88c3931b4",
        // "0x920786cff2A6f601975874Bb24C63f0115Df7dc8",
        // "0xb09cf345294aDD1066543B22FD7384185F7C6fCA",
        // "0x2438009ba14A93e82ab43c66838e57bE27A55Aa1",
        // "0x5618c4C0A9c024e77eb9A5b4424f492f94C86F14", // Beefy Spirit
    ];

    for (const address of approveSwapAddresses) {
        console.log(address);
        await wido.functions.addApprovedSwapAddress(address, {
            gasLimit: 150000,
        });
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
