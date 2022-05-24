import { EthersWeb3Provider, getContract } from "../frameworks/ethers/index";
import erc20Abi from "../contract/erc20.json";
import { BigNumber, ethers } from "ethers";
import { getNetworkId } from "../utils/network";
import config from "../config";
import { TransactionService } from "./TransactionService";
import { BiconomyImpl } from "../frameworks/biconomy/Biconomy";
import { Address } from "../state/apiSlice";
import { NetworkName } from "../state/reducers/widoSlice";

export class TokenService {
  transactionService: TransactionService;
  web3Provider: EthersWeb3Provider;
  biconomy: BiconomyImpl;

  constructor({ transactionService, web3Provider, biconomy }) {
    this.transactionService = transactionService;
    this.web3Provider = web3Provider;
    this.biconomy = biconomy;
  }

  async getUserTokensData({ network, accountAddress, tokenAddresses }) {
    const provider = this.web3Provider.getInstanceOf(network);
    const balancePromises: Array<Promise<BigNumber>> = [];
    for (const tokenAddress of tokenAddresses) {
      const contract = getContract(tokenAddress, erc20Abi, provider);
      balancePromises.push(contract.balanceOf(accountAddress));
    }
    const balances = await Promise.all(balancePromises);

    return balances.map((balance) => balance.toString());
  }

  async getTokenAllowance({
    network,
    accountAddress,
    tokenAddress,
    spenderAddress,
  }) {
    const provider = this.web3Provider.getInstanceOf(network);
    const erc20Contract = getContract(tokenAddress, erc20Abi, provider);
    const allowance = await erc20Contract.allowance(
      accountAddress,
      spenderAddress
    );
    return allowance.toString();
  }

  async approve(props: {
    network: NetworkName;
    tokenAddress: Address;
    spenderAddress: Address;
    amount: string;
  }) {
    const { network, tokenAddress, spenderAddress, amount } = props;
    return await this.transactionService.execute({
      network,
      methodName: "approve",
      contractAddress: tokenAddress,
      abi: erc20Abi,
      args: [spenderAddress, amount],
    });
  }

  async permit(props: {
    network: NetworkName;
    tokenAddress: Address;
    spenderAddress: Address;
    amount: string;
    onSignSuccess: () => void;
  }) {
    const { network, tokenAddress, spenderAddress, amount } = props;

    const signer = this.web3Provider.getSigner();
    const userAddress = await signer.getAddress();
    const erc20Contract = getContract(tokenAddress, erc20Abi, signer);

    const nonce = await erc20Contract.nonces(userAddress);
    const expiry = Math.floor(Date.now() / 1000 + 30 * 24 * 60 * 60); // 30 days expiry

    const message = {
      owner: userAddress,
      spender: spenderAddress,
      value: amount ? amount : ethers.constants.MaxUint256.toString(),
      nonce: parseInt(nonce),
      deadline: expiry,
    };

    // TODO: Make permit generic to any coin, and any blockchain.
    // This only works for USDC
    const domainType = [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ];

    const permitType = [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ];

    const domainData = {
      name: "USD Coin",
      version: network === "fantom" ? "1" : "2",
      chainId: getNetworkId(network),
      verifyingContract: tokenAddress,
    };

    const msgParam = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Permit: permitType,
      },
      domain: domainData,
      primaryType: "Permit",
      message: message,
    });

    const signature = await this.transactionService.requestSignature({
      msgParam,
    });

    // TODO: Check Biconomy Support for this chain and token
    const sig = signature.substring(2);
    const r = "0x" + sig.substring(0, 64);
    const s = "0x" + sig.substring(64, 128);
    let v = parseInt(sig.substring(128, 130), 16);
    // Updating `v` for Ledger wallet
    if (v === 0 || v === 1) {
      v += 27;
    }

    if (!config.DEBUG) {
      return await this.transactionService.biconomyExecution({
        biconomy: this.biconomy,
        accountAddress: userAddress,
        abi: erc20Abi,
        contractAddress: tokenAddress,
        args: [userAddress, spenderAddress, amount, message.deadline, v, r, s],
      });
    } else {
      return await this.transactionService.execute({
        network,
        methodName: "permit",
        abi: erc20Abi,
        contractAddress: tokenAddress,
        args: [userAddress, spenderAddress, amount, message.deadline, v, r, s],
        localTx: true,
      });
    }
  }
}
