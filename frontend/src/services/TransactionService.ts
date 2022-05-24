import { EthersWeb3Provider, getContract } from "../frameworks/ethers/index";

import config from "../config";
import { notify, UpdateNotification } from "../frameworks/blocknative/Notify";
import { TransactionReceipt } from "@ethersproject/providers";
import { openLinkSafely } from "../utils/utils";
import { ethers } from "ethers";

export class TransactionService {
  private web3Provider: EthersWeb3Provider;

  constructor({ web3Provider }: { web3Provider: EthersWeb3Provider }) {
    this.web3Provider = web3Provider;
  }

  public async execute(props) {
    const { network, methodName, abi, contractAddress, args, localTx, value } =
      props;

    const gasFees = {};
    try {
      if (network === "mainnet") {
        // TODO: Analyze if gas service required
        // gasFees = await this.gasService.getGasFees();
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const txOverrides = {
        // maxFeePerGas: gasFees.maxFeePerGas,
        // maxPriorityFeePerGas: gasFees.maxPriorityFeePerGas,
        // TODO: Enable overrides
        // ...overrides,
        value: value || 0,
      };

      if (config.DEBUG) {
        // Note: gasLimit for testing purpose
        txOverrides["gasLimit"] = 2500000;
      }

      const txArgs = args ? [...args, txOverrides] : [txOverrides];

      let signer = this.web3Provider.getSigner();
      if (localTx === true) {
        signer = new ethers.Wallet(
          "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
          this.web3Provider.getInstanceOf(network)
        );
      }
      const contract = getContract(contractAddress, abi, signer);

      const unsignedTx = await contract.populateTransaction[methodName](
        ...txArgs
      );

      // TODO call contract verification here.

      const tx = await signer.sendTransaction(unsignedTx);
      return tx;
    } catch (error) {
      console.log("📜 LOG > execute > error", error);
      // Retry as a legacy tx, for specific error in metamask v10 + ledger transactions
      // Metamask RPC Error: Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559
      if (error.code === -32602) {
        const txOverrides = {
          gasPrice: gasFees.gasPrice,
          // TODO: Enable overrides
          // ...overrides,
        };
        const txArgs = args ? [...args, txOverrides] : [txOverrides];
        const signer = this.web3Provider.getSigner();
        const contract = getContract(contractAddress, abi, signer);

        const unsignedTx = await contract.populateTransaction[methodName](
          ...txArgs
        );
        const tx = await signer.sendTransaction(unsignedTx);
        return tx;
      }

      throw error;
    }
  }

  public async biconomyExecution(props) {
    const { biconomy, accountAddress, abi, contractAddress, args } = props;

    biconomy.ensure();

    // Send to biconomy
    const contract = getContract(
      contractAddress,
      abi,
      biconomy.biconomy.getSignerByAddress(accountAddress)
    );
    const tx = await contract.permit(...args);
    console.log("📜 LOG > biconomyExecution > tx", tx);
    return tx;
  }

  // Make Biconomy functions generic
  public async biconomyGaslessOrderExecution(props) {
    const { biconomy, accountAddress, abi, contractAddress, args } = props;
    console.log("📜 LOG > biconomyGaslessOrderExecution > args", args);
    if (biconomy.isReady) {
      // Send to biconomy
      const contract = getContract(
        contractAddress,
        abi,
        biconomy.biconomy.getSignerByAddress(accountAddress)
      );
      const tx = await contract.executeOrderWithSignature(...args);
      console.log("📜 LOG > biconomyGaslessOrderExecution > tx", tx);
      return tx;
    } else {
      const tx = await this.execute({
        network: "fantom",
        methodName: "executeOrderWithSignature",
        abi,
        contractAddress,
        args,
      });
      console.log("📜 LOG > biconomyGaslessOrderExecution > tx", tx);
      return tx;
    }
  }

  public async requestSignature(props) {
    const { msgParam } = props;
    try {
      const signer = this.web3Provider.getSigner();
      const fromAddress = await signer.getAddress();

      const result = await signer.provider.send("eth_signTypedData_v4", [
        fromAddress,
        msgParam,
      ]);
      return result;
    } catch (error) {
      console.log("📜 LOG > requestSignature > error", error);
      throw error;
    }
  }

  public handleTransaction = async ({
    network,
    tx,
    renderNotification = true,
  }): Promise<TransactionReceipt> => {
    const { NETWORK_SETTINGS } = config;
    const currentNetworkSettings = NETWORK_SETTINGS[network];
    let updateNotification: UpdateNotification | undefined;
    let dismissNotification: () => void = () => undefined;
    try {
      if (renderNotification) {
        // TODO: We may need to change the network in Notify
        if (currentNetworkSettings.notifyEnabled) {
          notify.hash(tx.hash);
        } else {
          const { update, dismiss } = notify.notification({
            eventCode: "txSentCustom",
            type: "pending",
            message: "Your transaction has been sent to the network",
            onclick: () => {
              openLinkSafely(
                `${currentNetworkSettings.blockExplorerUrl}/tx/${tx.hash}`
              );
            },
          });
          updateNotification = update;
          dismissNotification = dismiss;
        }
      }

      const provider = this.web3Provider.getInstanceOf(network);
      const { txConfirmations } = currentNetworkSettings;

      const receipt = await provider.waitForTransaction(
        tx.hash,
        txConfirmations
      );
      if (receipt.status == 0) {
        throw new Error("Transaction failed.");
      }

      if (updateNotification) {
        updateNotification({
          eventCode: "txConfirmedCustom",
          type: "success",
          message: "Your transaction has succeeded",
          onclick: () => {
            openLinkSafely(
              `${currentNetworkSettings.blockExplorerUrl}/tx/${tx.hash}`
            );
          },
        });
      }
      return receipt;
    } catch (error: any) {
      if (error.code === "TRANSACTION_REPLACED") {
        if (error.cancelled) {
          if (updateNotification) {
            updateNotification({
              eventCode: "txFailedCustom",
              type: "error",
              message: "Your transaction has been cancelled",
            });
          }
          throw new Error("Transaction Cancelled");
        } else {
          dismissNotification();
          return await this.handleTransaction({
            tx: error.replacement,
            network,
            renderNotification: !currentNetworkSettings.notifyEnabled,
          });
        }
      }

      if (updateNotification) {
        updateNotification({
          eventCode: "txFailedCustom",
          type: "error",
          message: "Your transaction has failed",
          onclick: () => {
            openLinkSafely(
              `${currentNetworkSettings.blockExplorerUrl}/tx/${tx.hash}`
            );
          },
        });
      }

      throw error;
    }
  };
}
