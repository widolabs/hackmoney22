const { expect } = require("chai");
const utils = require("./test-utils");

CHAIN_ID = 250;
USDC = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
FANTOM_yvUSDC = "0xEF0210eB96c7EB36AF8ed1c20306462764935607";
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
ETH_CHAIN_ID = 1;

describe("CrossChainRouter", function () {
    let chainId, stargateRouterAddress;
    let owner, acc1, acc2;

    before(async function () {
        chainId = CHAIN_ID;
        stargateRouterAddress = "0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d";
        [owner, acc1, acc2] = await ethers.getSigners();
        console.log(acc1.address);
    });

    beforeEach(async function () {
        await utils.resetToken(acc1, USDC);
        await utils.resetToken(acc1, FANTOM_yvUSDC);

        const WidoRouter = await ethers.getContractFactory("WidoRouter");
        this.widoRouter = await WidoRouter.deploy();
        await this.widoRouter.deployed();
        await this.widoRouter.initialize(chainId, stargateRouterAddress);
        await this.widoRouter.setStargateChainId(1, 1);
        console.log(`WidoRouter address: ${this.widoRouter.address}`);

        const WidoReceiver = await ethers.getContractFactory("WidoReceiver");
        this.widoReceiver = await WidoReceiver.deploy(
            this.widoRouter.address,
            stargateRouterAddress
        );
        await this.widoReceiver.deployed();
        console.log(`WidoReceiver address: ${this.widoReceiver.address}`);

        await utils.prepForToken(acc1.address, USDC, "2000");
        await utils.approveWidoForToken(acc1, USDC, this.widoRouter.address);
    });

    it("executeCrossChainOrder() - USDC -> USDC", async function () {
        const cco = await utils.buildAndSignCrossChainOrder(
            acc1,
            {
                user: acc1.address,
                fromToken: USDC,
                fromChainId: chainId,
                toToken: USDC,
                toChainId: ETH_CHAIN_ID,
                fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
                minToTokenAmount: ethers.utils.parseUnits("950", 6).toString(),
                nonce: 0,
                expiration: 1732307386,
            },
            this.widoRouter.address
        );

        await this.widoRouter.executeCrossChainOrderWithSignature(
            cco.crossChainOrder,
            cco.v,
            cco.r,
            cco.s,
            [],
            [],
            {
                srcPoolId: 22,
                dstPoolId: 22,
                bridgeToken: USDC,
                minBridgedToken: ethers.utils.parseUnits("950", 6).toString(),
                dstGasForCall: 0,
                dstAddress: acc1.address,
            },
            {
                gasLimit: 2500000,
            }
        );

        const usdcBal = await utils.balanceOf(USDC, acc1.address);
        expect(usdcBal.gt(ethers.utils.parseUnits("1950", 6))).to.be.true;
        expect(usdcBal.lt(ethers.utils.parseUnits("2000", 6))).to.be.true;
    });

    it("executeCrossChainOrder() - USDC -> yvUSDC", async function () {
        await this.widoRouter.addApprovedSwapAddress(FANTOM_yvUSDC);
        const cco = await utils.buildAndSignCrossChainOrder(
            acc1,
            {
                user: acc1.address,
                fromToken: USDC,
                fromChainId: chainId,
                toToken: FANTOM_yvUSDC,
                toChainId: ETH_CHAIN_ID,
                fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
                minToTokenAmount: ethers.utils.parseUnits("950", 6).toString(),
                nonce: 0,
                expiration: 1732307386,
            },
            this.widoRouter.address
        );

        // From https://api.joinwido.com/swaproute?chain_id=250&from_address=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&to_address=0xEF0210eB96c7EB36AF8ed1c20306462764935607&amount=1000000000
        const dstSwapRoute = [
            {
                fromToken: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                toToken: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapAddress: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapData: "0xd0e30db0",
            },
        ];
        await this.widoRouter.executeCrossChainOrderWithSignature(
            cco.crossChainOrder,
            cco.v,
            cco.r,
            cco.s,
            [],
            dstSwapRoute,
            {
                srcPoolId: 22,
                dstPoolId: 22,
                bridgeToken: USDC,
                minBridgedToken: ethers.utils.parseUnits("975", 6).toString(),
                dstGasForCall: 500000,
                dstAddress: this.widoReceiver.address,
            },
            {
                gasLimit: 2500000,
            }
        );

        const usdcBal = await utils.balanceOf(USDC, acc1.address);
        const yvUsdcBal = await utils.balanceOf(FANTOM_yvUSDC, acc1.address);
        console.log(`USDC balance: ${usdcBal.toString()}`);
        console.log(`yvUSDC balance: ${yvUsdcBal.toString()}`);
        expect(usdcBal.eq(ethers.utils.parseUnits("1000", 6))).to.be.true;
        expect(yvUsdcBal.gt(ethers.utils.parseUnits("950", 6))).to.be.true;
    });

    it("executeCrossChainOrder() - yvUSDC -> USDC", async function () {
        await this.widoRouter.addApprovedSwapAddress(FANTOM_yvUSDC);
        await utils.prepForToken(acc1.address, FANTOM_yvUSDC, "1000");
        await utils.approveWidoForToken(
            acc1,
            FANTOM_yvUSDC,
            this.widoRouter.address
        );

        const cco = await utils.buildAndSignCrossChainOrder(
            acc1,
            {
                user: acc1.address,
                fromToken: FANTOM_yvUSDC,
                fromChainId: chainId,
                toToken: USDC,
                toChainId: ETH_CHAIN_ID,
                fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
                minToTokenAmount: ethers.utils.parseUnits("1029", 6).toString(),
                nonce: 0,
                expiration: 1732307386,
            },
            this.widoRouter.address
        );

        // From https://api.joinwido.com/swaproute?chain_id=250&from_address=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&to_address=0xEF0210eB96c7EB36AF8ed1c20306462764935607&amount=1000000000
        const srcSwapRoute = [
            {
                fromToken: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                toToken: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                swapAddress: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapData:
                    "0x2e1a7d4d000000000000000000000000000000000000000000000000000000003b9aca00",
            },
        ];
        await this.widoRouter.executeCrossChainOrderWithSignature(
            cco.crossChainOrder,
            cco.v,
            cco.r,
            cco.s,
            srcSwapRoute,
            [],
            {
                srcPoolId: 22,
                dstPoolId: 22,
                bridgeToken: USDC,
                minBridgedToken: ethers.utils.parseUnits("1029", 6).toString(),
                dstGasForCall: 0,
                dstAddress: acc1.address,
            },
            {
                gasLimit: 2500000,
            }
        );

        const usdcBal = await utils.balanceOf(USDC, acc1.address);
        const yvUsdcBal = await utils.balanceOf(FANTOM_yvUSDC, acc1.address);
        expect(yvUsdcBal.eq(ethers.utils.parseUnits("0", 6))).to.be.true;
        expect(usdcBal.gt(ethers.utils.parseUnits("3029", 6))).to.be.true;
    });

    it("executeCrossChainOrder() - USDC -> yvUSDC [Contract has balance]", async function () {
        await utils.prepForToken(this.widoReceiver.address, USDC, "200");
        const widoInitialUsdcBal = await utils.balanceOf(
            USDC,
            this.widoRouter.address
        );
        console.log(`Wido initial balance: ${widoInitialUsdcBal}`);
        await this.widoRouter.addApprovedSwapAddress(FANTOM_yvUSDC);
        const cco = await utils.buildAndSignCrossChainOrder(
            acc1,
            {
                user: acc1.address,
                fromToken: USDC,
                fromChainId: chainId,
                toToken: FANTOM_yvUSDC,
                toChainId: ETH_CHAIN_ID,
                fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
                minToTokenAmount: ethers.utils.parseUnits("950", 6).toString(),
                nonce: 0,
                expiration: 1732307386,
            },
            this.widoRouter.address
        );

        // From https://api.joinwido.com/swaproute?chain_id=250&from_address=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&to_address=0xEF0210eB96c7EB36AF8ed1c20306462764935607&amount=1000000000
        const dstSwapRoute = [
            {
                fromToken: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                toToken: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapAddress: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapData: "0xd0e30db0",
            },
        ];
        expect(
            this.widoRouter.executeCrossChainOrderWithSignature(
                cco.crossChainOrder,
                cco.v,
                cco.r,
                cco.s,
                [],
                dstSwapRoute,
                {
                    srcPoolId: 22,
                    dstPoolId: 22,
                    bridgeToken: USDC,
                    minBridgedToken: ethers.utils
                        .parseUnits("975", 6)
                        .toString(),
                    dstGasForCall: 500000,
                    dstAddress: this.widoReceiver.address,
                },
                {
                    gasLimit: 2500000,
                }
            )
        ).to.be.reverted;
    });

    it("executeCrossChainOrder() - USDC -> yvUSDC [Failed Swap Destination]", async function () {
        await utils.prepForToken(this.widoReceiver.address, USDC, "200");
        const widoInitialUsdcBal = await utils.balanceOf(
            USDC,
            this.widoReceiver.address
        );
        console.log(`Wido initial balance: ${widoInitialUsdcBal}`);
        await this.widoRouter.addApprovedSwapAddress(FANTOM_yvUSDC);
        const cco = await utils.buildAndSignCrossChainOrder(
            acc1,
            {
                user: acc1.address,
                fromToken: USDC,
                fromChainId: chainId,
                toToken: FANTOM_yvUSDC,
                toChainId: ETH_CHAIN_ID,
                fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
                minToTokenAmount: ethers.utils.parseUnits("1950", 6).toString(),
                nonce: 0,
                expiration: 1732307386,
            },
            this.widoRouter.address
        );

        // From https://api.joinwido.com/swaproute?chain_id=250&from_address=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&to_address=0xEF0210eB96c7EB36AF8ed1c20306462764935607&amount=1000000000
        const dstSwapRoute = [
            {
                fromToken: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                toToken: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapAddress: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapData: "0xd0e30db0",
            },
        ];
        expect(
            this.widoRouter.executeCrossChainOrderWithSignature(
                cco.crossChainOrder,
                cco.v,
                cco.r,
                cco.s,
                [],
                dstSwapRoute,
                {
                    srcPoolId: 22,
                    dstPoolId: 22,
                    bridgeToken: USDC,
                    minBridgedToken: ethers.utils
                        .parseUnits("975", 6)
                        .toString(),
                    dstGasForCall: 500000,
                    dstAddress: this.widoReceiver.address,
                },
                {
                    gasLimit: 2500000,
                }
            )
        ).to.be.reverted;

        const widoFinalUsdcBal = await utils.balanceOf(
            USDC,
            this.widoReceiver.address
        );

        console.log(`Wido final balance: ${widoFinalUsdcBal}`);
        expect(widoFinalUsdcBal.eq(widoInitialUsdcBal)).to.be.true;
        const usdcBal = await utils.balanceOf(USDC, acc1.address);
        console.log(`USDC balance: ${usdcBal.toString()}`);
        expect(usdcBal.gt(ethers.utils.parseUnits("1000", 6))).to.be.true;
    });

    it("executeCrossChainOrder() - USDC -> yvUSDC", async function () {
        await this.widoRouter.addApprovedSwapAddress(FANTOM_yvUSDC);
        const order = {
            user: acc1.address,
            fromToken: USDC,
            fromChainId: chainId,
            toToken: FANTOM_yvUSDC,
            toChainId: ETH_CHAIN_ID,
            fromTokenAmount: ethers.utils.parseUnits("1000", 6).toString(),
            minToTokenAmount: ethers.utils.parseUnits("950", 6).toString(),
            nonce: 0,
            expiration: 1732307386,
        };

        // From https://api.joinwido.com/swaproute?chain_id=250&from_address=0x04068DA6C83AFCFA0e13ba15A6696662335D5B75&to_address=0xEF0210eB96c7EB36AF8ed1c20306462764935607&amount=1000000000
        const dstSwapRoute = [
            {
                fromToken: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
                toToken: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapAddress: "0xEF0210eB96c7EB36AF8ed1c20306462764935607",
                swapData: "0xd0e30db0",
            },
        ];
        await this.widoRouter.connect(acc1).executeCrossChainOrder(
            order,
            [],
            dstSwapRoute,
            {
                srcPoolId: 22,
                dstPoolId: 22,
                bridgeToken: USDC,
                minBridgedToken: ethers.utils.parseUnits("975", 6).toString(),
                dstGasForCall: 500000,
                dstAddress: this.widoReceiver.address,
            },
            {
                gasLimit: 2500000,
                value: 1000000000,
            }
        );

        const usdcBal = await utils.balanceOf(USDC, acc1.address);
        const yvUsdcBal = await utils.balanceOf(FANTOM_yvUSDC, acc1.address);
        console.log(`USDC balance: ${usdcBal.toString()}`);
        console.log(`yvUSDC balance: ${yvUsdcBal.toString()}`);
        expect(usdcBal.eq(ethers.utils.parseUnits("1000", 6))).to.be.true;
        expect(yvUsdcBal.gt(ethers.utils.parseUnits("950", 6))).to.be.true;
    });
});
