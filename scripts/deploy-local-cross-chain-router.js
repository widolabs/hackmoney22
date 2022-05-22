const hre = require("hardhat");
const utils = require("../test/test-utils");

async function main() {
    const TESTNET_CHAIN_ID = 1500;
    const STARGATE_ROUTER = "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d";

    const WidoRouter = await ethers.getContractFactory("WidoRouter");
    const WidoReceiver = await ethers.getContractFactory("WidoReceiver");

    const wido = await upgrades.deployProxy(WidoRouter, [
        TESTNET_CHAIN_ID,
        STARGATE_ROUTER,
    ]);
    await wido.deployed();

    const widoReceiver = await upgrades.deployProxy(WidoReceiver, [
        wido.address,
        STARGATE_ROUTER,
    ]);
    await widoReceiver.deployed();

    console.log("WidoRouter deployed to:", wido.address);
    console.log("WidoReceiver deployed to:", widoReceiver.address);

    console.log("Now added approved swap addresses...");
    const approveSwapAddresses = [
        "0xDEF189DeAEF76E379df891899eb5A00a94cBC250", // 0x
        "0x0A0b23D9786963DE69CB2447dC125c49929419d8", // Yearn MIM Vault
        "0x148c05caf1Bb09B5670f00D511718f733C54bC4c", // f-USDT
        "0x1b48641D8251c3E84ecbe3f2bD76B3701401906D", // DOLA
        "0x637eC617c86D24E421328e6CAEa1d92114892439", // DAI
        "0x357ca46da26E1EefC195287ce9D838A6D5023ef3", // FRAX
        "0xEF0210eB96c7EB36AF8ed1c20306462764935607", // USDC
    ];

    for (const address of approveSwapAddresses) {
        console.log(address);
        await wido.functions.addApprovedSwapAddress(address);
    }

    const accounts = await ethers.getSigners();
    const waitFor = [];
    for (let i = 0; i <= 5; i++) {
        waitFor.push(
            utils.prepForToken(
                accounts[i].address,
                "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // Fantom USDC
                "50000"
            )
        );
        waitFor.push(
            utils.approveWidoForToken(
                accounts[i],
                "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                wido.address
            )
        );
    }
    await Promise.all(waitFor);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
