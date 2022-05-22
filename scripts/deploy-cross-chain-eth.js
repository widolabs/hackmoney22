const { upgrades } = require("hardhat");
const hre = require("hardhat");
const utils = require("../test/test-utils");

async function main() {
    const CHAIN_ID = 1;
    const STARGATE_ROUTER = "0x8731d54E9D02c286767d56ac03e8037C07e01e98";

    const WidoRouter = await ethers.getContractFactory("WidoRouter");
    const WidoReceiver = await ethers.getContractFactory("WidoReceiver");

    // const wido = await upgrades.deployProxy(WidoRouter, [
    //     CHAIN_ID,
    //     STARGATE_ROUTER,
    // ]);
    // await wido.deployed();
    const wido = WidoRouter.attach(
        "0xB8F77519cD414CB1849e4b7B4824183629F6B239"
    );

    // Note: Receiver is not deployed in ETH mainnet.
    // const widoReceiver = await upgrades.deployProxy(WidoReceiver, [
    //     wido.address,
    //     STARGATE_ROUTER,
    // ]);
    // await widoReceiver.deployed();
    // const widoReceiver = WidoReceiver.attach("");

    console.log("WidoRouter deployed to:", wido.address);
    // console.log("WidoReceiver deployed to:", widoReceiver.address);

    console.log("Now add stargate chain id...");
    const stargateChainIdByNetworkChainId = {
        250: 12,
        43114: 6,
        1: 1,
    };

    for (const chainId in stargateChainIdByNetworkChainId) {
        await wido.functions.setStargateChainId(
            chainId,
            stargateChainIdByNetworkChainId[chainId]
        );
    }

    console.log("Now added approved swap addresses...");
    const approveSwapAddresses = ["0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE"];

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
