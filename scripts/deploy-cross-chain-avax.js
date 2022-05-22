const { upgrades } = require("hardhat");
const hre = require("hardhat");
const utils = require("../test/test-utils");

async function main() {
    const CHAIN_ID = 43114;
    const STARGATE_ROUTER = "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd";

    const WidoRouter = await ethers.getContractFactory("WidoRouter");
    const WidoReceiver = await ethers.getContractFactory("WidoReceiver");

    // const wido = await upgrades.deployProxy(WidoRouter, [
    //     CHAIN_ID,
    //     STARGATE_ROUTER,
    // ]);
    // await wido.deployed();
    const wido = WidoRouter.attach(
        "0x5873e3726B5AFDEB7C5fc46D8b79527c5b30Ad90"
    );

    // const widoReceiver = await upgrades.deployProxy(WidoReceiver, [
    //     wido.address,
    //     STARGATE_ROUTER,
    // ]);
    // await widoReceiver.deployed();
    const widoReceiver = WidoReceiver.attach(
        "0x7526c77C3F0cf75c79c2443244f0757F84B4673C"
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
        // "0x7f62aF30081178F502c3d4DA17825e58d240D737",
        // "0x6674f3961C5908B086A5551377806f4BA8F0Ac99",
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
