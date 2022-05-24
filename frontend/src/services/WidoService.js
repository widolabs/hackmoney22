import { getContract } from "../frameworks/ethers/index";
import { getNetworkId } from "../utils/network";
import config from "../config";
import depositAbi from "../contract/deposit.json";
import withdrawAbi from "../contract/withdraw.json";
import swapAbi from "../contract/swap.json";
import widoRouterAbi from "../contract/widoRouter.json";
import widoCrossChainRouterAbi from "../contract/widoCrossChainRouter.json";
import stargateRouterAbi from "../contract/stargateRouter.json";
import { ethers } from "ethers";

export class WidoService {
  constructor({ transactionService, web3Provider, biconomy }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.biconomy = biconomy;
  }

  async batchWithdraw(props) {
    const { network, vaultAddress, tokenAddress, amount } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const widoContractAddress = config.WIDO_CONTRACTS[network].WITHDRAW;
    const widoContract = getContract(widoContractAddress, withdrawAbi, signer);

    const nonce = await widoContract.nonces(
      userAddress,
      tokenAddress,
      vaultAddress
    );
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      user: userAddress,
      token: tokenAddress,
      vault: vaultAddress,
      amount: amount,
      nonce: parseInt(nonce),
      expiration: expiry,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const withdrawType = [
      { name: "user", type: "address" },
      { name: "vault", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "token", type: "address" },
      { name: "nonce", type: "uint32" },
      { name: "expiration", type: "uint32" },
    ];

    const domainData = {
      name: "WidoWithdraw",
      version: "1",
      chainId: getNetworkId(network),
      verifyingContract: widoContractAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Withdraw: withdrawType,
      },
      domain: domainData,
      primaryType: "Withdraw",
      message: message,
    });

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    return { message, signature };
  }

  async batchDeposit(props) {
    const { network, vaultAddress, tokenAddress, amount } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const widoContractAddress = config.WIDO_CONTRACTS[network].DEPOSIT;
    const widoContract = getContract(widoContractAddress, depositAbi, signer);

    const nonce = await widoContract.nonces(
      userAddress,
      tokenAddress,
      vaultAddress
    );
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      user: userAddress,
      token: tokenAddress,
      vault: vaultAddress,
      amount: amount,
      nonce: parseInt(nonce),
      expiration: expiry,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const depositType = [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
      { name: "vault", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint32" },
      { name: "expiration", type: "uint32" },
    ];

    const domainData = {
      name: "Wido",
      version: "1",
      chainId: getNetworkId(network),
      verifyingContract: widoContractAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Deposit: depositType,
      },
      domain: domainData,
      primaryType: "Deposit",
      message: message,
    });

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    return { message, signature };
  }

  async batchSwap(props) {
    const { network, fromVaultAddress, toVaultAddress, amount } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const widoContractAddress = config.WIDO_CONTRACTS[network].SWAP;
    const widoContract = getContract(widoContractAddress, swapAbi, signer);

    const nonce = await widoContract.nonces(
      userAddress,
      fromVaultAddress,
      toVaultAddress
    );
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      user: userAddress,
      from_vault: fromVaultAddress,
      amount: amount,
      to_vault: toVaultAddress,
      nonce: parseInt(nonce),
      expiration: expiry,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const swapType = [
      { name: "user", type: "address" },
      { name: "from_vault", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to_vault", type: "address" },
      { name: "nonce", type: "uint32" },
      { name: "expiration", type: "uint32" },
    ];

    const domainData = {
      name: "WidoSwap",
      version: "1",
      chainId: getNetworkId(network),
      verifyingContract: widoContractAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Swap: swapType,
      },
      domain: domainData,
      primaryType: "Swap",
      message: message,
    });

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    return { message, signature };
  }

  async gaslessOrder(props) {
    // TODO: Check Biconomy support and then ask for signature.
    const {
      network,
      fromTokenAddress,
      toTokenAddress,
      fromTokenAmount,
      minToTokenAmount,
    } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const widoContractAddress = config.WIDO_CONTRACTS[network].ORDER;
    const widoContract = getContract(
      widoContractAddress,
      widoRouterAbi,
      signer
    );

    const nonce = await widoContract.nonces(userAddress);
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      user: userAddress,
      fromToken: fromTokenAddress,
      toToken: toTokenAddress,
      fromTokenAmount: fromTokenAmount,
      minToTokenAmount: minToTokenAmount,
      nonce: parseInt(nonce),
      expiration: expiry,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const orderType = [
      { name: "user", type: "address" },
      { name: "fromToken", type: "address" },
      { name: "toToken", type: "address" },
      { name: "fromTokenAmount", type: "uint256" },
      { name: "minToTokenAmount", type: "uint256" },
      { name: "nonce", type: "uint32" },
      { name: "expiration", type: "uint32" },
    ];

    const domainData = {
      name: "WidoRouter",
      version: "1",
      chainId: getNetworkId(network),
      verifyingContract: widoContractAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Order: orderType,
      },
      domain: domainData,
      primaryType: "Order",
      message: message,
    });
    console.log("📜 LOG > gaslessOrder > msgParam", msgParam);

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    return { userAddress, message, signature };
  }

  async executeOrder({ network, userAddress, message, signature, swapRoute }) {
    const sig = signature.substring(2);
    const r = "0x" + sig.substring(0, 64);
    const s = "0x" + sig.substring(64, 128);
    let v = parseInt(sig.substring(128, 130), 16);
    // Updating `v` for Ledger wallet
    if (v === 0 || v === 1) {
      v += 27;
    }
    const widoContractAddress = config.WIDO_CONTRACTS[network].ORDER;

    return await this.transactionService.biconomyGaslessOrderExecution({
      biconomy: this.biconomy,
      accountAddress: userAddress,
      abi: widoRouterAbi,
      contractAddress: widoContractAddress,
      args: [message, swapRoute, v, r, s],
    });
  }

  async executeOrderLocalEnv({ network, message, signature, swapRoute }) {
    const sig = signature.substring(2);
    const r = "0x" + sig.substring(0, 64);
    const s = "0x" + sig.substring(64, 128);
    let v = parseInt(sig.substring(128, 130), 16);
    // Updating `v` for Ledger wallet
    if (v === 0 || v === 1) {
      v += 27;
    }
    const widoContractAddress = config.WIDO_CONTRACTS[network].ORDER;

    return await this.transactionService.execute({
      network,
      methodName: "executeOrderWithSignature",
      abi: widoRouterAbi,
      contractAddress: widoContractAddress,
      args: [message, swapRoute, v, r, s],
      localTx: true,
    });
  }

  async requestCrossChainOrder(props) {
    const {
      fromNetwork,
      fromTokenAddress,
      toNetwork,
      toTokenAddress,
      fromTokenAmount,
      minToTokenAmount,
    } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const widoContractAddress =
      config.WIDO_CONTRACTS[fromNetwork].CROSS_CHAIN_ORDER;
    const widoContract = getContract(
      widoContractAddress,
      widoCrossChainRouterAbi,
      signer
    );

    const nonce = await widoContract.nonces(userAddress);
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      user: userAddress,
      fromToken: fromTokenAddress,
      fromChainId: getNetworkId(fromNetwork),
      fromTokenAmount: fromTokenAmount,
      toToken: toTokenAddress,
      toChainId: getNetworkId(toNetwork),
      minToTokenAmount: minToTokenAmount,
      nonce: parseInt(nonce),
      expiration: expiry,
    };

    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const crossChainOrderType = [
      { name: "user", type: "address" },
      { name: "fromToken", type: "address" },
      { name: "fromChainId", type: "uint32" },
      { name: "fromTokenAmount", type: "uint256" },
      { name: "toToken", type: "address" },
      { name: "toChainId", type: "uint32" },
      { name: "minToTokenAmount", type: "uint256" },
      { name: "nonce", type: "uint32" },
      { name: "expiration", type: "uint32" },
    ];

    const domainData = {
      name: "WidoRouter",
      version: "1",
      chainId: getNetworkId(fromNetwork),
      verifyingContract: widoContractAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        CrossChainOrder: crossChainOrderType,
      },
      domain: domainData,
      primaryType: "CrossChainOrder",
      message: message,
    });

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    return { userAddress, message, signature };
  }

  async getLzFees(fromNetwork, toNetwork, order, dstSwapRoute, bridgeOptions) {
    const widoContractAddress =
      config.WIDO_CONTRACTS[fromNetwork].CROSS_CHAIN_ORDER;
    const widoContract = getContract(
      widoContractAddress,
      widoCrossChainRouterAbi,
      this.web3Provider.getInstanceOf(fromNetwork)
    );
    const stargateRouter = getContract(
      await widoContract.stargateRouter(),
      stargateRouterAbi,
      this.web3Provider.getInstanceOf(fromNetwork)
    );
    let quoteData = await stargateRouter.quoteLayerZeroFee(
      config.STARGATE_CHAIN_ID[toNetwork],
      1,
      bridgeOptions.dstAddress,
      ethers.utils.defaultAbiCoder.encode(
        [
          "tuple(address, address, uint32, address, uint32, uint256, uint256, uint32, uint32)",
          "tuple(address, address, address, bytes)[]",
        ],
        [Object.values(order), dstSwapRoute.map((x) => Object.values(x))]
      ),
      {
        dstGasForCall: bridgeOptions.dstGasForCall,
        dstNativeAmount: 0,
        dstNativeAddr: "0x",
      }
    );

    return quoteData[0];
  }

  async executeCrossChainOrder(props) {
    const {
      user,
      fromTokenAddress,
      fromNetwork,
      toTokenAddress,
      toNetwork,
      fromTokenAmount,
      minToTokenAmount,
      srcSwapRoute,
      dstSwapRoute,
      bridgeOptions,
    } = props;

    const order = {
      user,
      fromToken: fromTokenAddress,
      fromChainId: getNetworkId(fromNetwork),
      toToken: toTokenAddress,
      toChainId: getNetworkId(toNetwork),
      fromTokenAmount: fromTokenAmount,
      minToTokenAmount: minToTokenAmount,
      nonce: 0,
      expiration: 0,
    };

    const lzFee = this.getLzFees(
      fromNetwork,
      toNetwork,
      order,
      dstSwapRoute,
      bridgeOptions
    );

    return await this.transactionService.execute({
      network: fromNetwork,
      methodName: "executeCrossChainOrder",
      abi: widoCrossChainRouterAbi,
      contractAddress: config.WIDO_CONTRACTS[fromNetwork].CROSS_CHAIN_ORDER,
      args: [order, srcSwapRoute, dstSwapRoute, bridgeOptions],
      value: lzFee,
    });
  }

  async executeCrossChainOrderWithSignature(props) {
    // TODO: Implement. This will look very similar to `executeOrder`.
    // Low priority, as it only enables gasless transaction.
  }
}
