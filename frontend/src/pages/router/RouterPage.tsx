import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  DialogActions,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BootstrapDialogTitle } from "../../components/WidoTogetherForm";
import { useAppDispatch, useAppSelector } from "../../state/store";
import {
  chainIdMapping,
  selectDistinctGenericFilterList,
  selectVaultListForSwaps,
} from "../../state/reducers/vaultSlice";
import { Asset, AssetPicker } from "./AssetPicker";
import { CompareArrowsRounded, ExpandMore } from "@mui/icons-material";
import { AmountInput } from "./AmountInput";
import { fetchAllUserBalances } from "../../state/covalentApi.slice";
import { LoadingButton } from "../../components/Button";
import { walletSelect } from "../../state/reducers/currentUserSlice";
import { getNetwork, getNetworkExplorerURLFromName } from "../../utils/network";
import { Footer } from "../../app/Footer";
import { ethers } from "ethers";
import CONFIG from "../../config";
import {
  approve,
  getTokenAllowance,
  selectTokenBalance,
} from "../../state/reducers/tokenSlice";
import {
  crossChainOrder,
  estimateGasFee,
} from "../../state/reducers/widoSlice";
import { selectTokenListForSwaps } from "../../state/reducers/tokenListSlice";
import { LoadingIndicator } from "../../components/LoadingIndicator";
import { SafeLink } from "../../components/SafeLink";
import { formatAsNumber } from "../../utils/number";

type TxState = "none" | "pending" | "success" | "failed";

export function RouterPage() {
  const dispatch = useAppDispatch();

  const vaults = useAppSelector(selectVaultListForSwaps);
  const tokens = useAppSelector(selectTokenListForSwaps);

  const [fromAsset, setFromAsset] = useState<Asset>();
  const [toAsset, setToAsset] = useState<Asset>();

  const chainMap = useAppSelector(
    (state) => selectDistinctGenericFilterList(state).chain
  );

  const isWalletConnected = useAppSelector(
    (state) => state.currentUser.isConnected
  );
  const isWalletConnecting = useAppSelector(
    (state) => state.currentUser.isLoading
  );

  const userAddress = useAppSelector(
    (state) => state.currentUser.selectedAddress
  );
  useEffect(() => {
    if (!userAddress) return;
    dispatch(fetchAllUserBalances(userAddress));
  }, [dispatch, userAddress]);

  const handleConnectWalletClick = useCallback(async () => {
    await dispatch(walletSelect({ source: "wido_swap" }));
  }, [dispatch]);

  const [txState, setTxState] = useState<TxState>("none");
  const [txHash, setTxHash] = useState<string>();

  const [inputAmount, setInputAmount] = useState("");
  const [inputHelper, setInputHelper] = useState("");
  const network = fromAsset ? getNetwork(fromAsset.chain_id) : undefined;

  const parsedAmount = ethers.utils.parseUnits(
    inputAmount === "" ? "0" : inputAmount,
    fromAsset ? fromAsset.decimals : 0
  );

  const isSigning = useAppSelector(
    (state) => state.wido.user.userActionsMap.isSigning
  );
  const isApproving = useAppSelector((state) => {
    if (!fromAsset || !network) return false;

    return (
      state.token.user.userTokensActionsMap[network][fromAsset.address]
        ?.isApproving ?? false
    );
  });

  const userTokenAllowance = useAppSelector((state) => {
    if (!fromAsset || !network) return ethers.BigNumber.from(0);

    const tokenAllowance =
      state.token.user.userTokensAllowancesMap[network][fromAsset.address];

    if (!tokenAllowance) return ethers.BigNumber.from(0);

    return ethers.BigNumber.from(
      tokenAllowance[CONFIG.WIDO_CONTRACTS[network]["CROSS_CHAIN_ORDER"]]
    );
  });

  useEffect(() => {
    if (!fromAsset || !network) return;

    dispatch(
      getTokenAllowance({
        network,
        tokenAddress: fromAsset?.address,
        spenderAddress: CONFIG.WIDO_CONTRACTS[network]["CROSS_CHAIN_ORDER"],
      })
    );
  }, [dispatch, network, fromAsset]);

  const balance = useAppSelector(
    selectTokenBalance(network, fromAsset?.address)
  );

  const approvalTooSmall = !userTokenAllowance.gt(parsedAmount);
  const alreadyApproved = userTokenAllowance.gt(0) && !approvalTooSmall;

  const selectionReady = !!fromAsset && !!toAsset;

  const fetchingGasFee = useRef(false);

  if (selectionReady && !fetchingGasFee.current) {
    fetchingGasFee.current = true;
    setTimeout(() => {
      dispatch(
        estimateGasFee({
          fromNetwork: getNetwork(fromAsset.chain_id),
          fromTokenAddress: fromAsset.address,
          toNetwork: getNetwork(toAsset.chain_id),
          toTokenAddress: toAsset.address,
          amount: parsedAmount.toString(),
        })
      ).then((gasFee) => {
        fetchingGasFee.current = false;
        console.log("📜 LOG > SwapPage > gasFee", gasFee);
      });
    });
  }

  const handleApprove = useCallback(() => {
    if (!fromAsset || !network) return;

    const tokenAddress = fromAsset.address;
    const spenderAddress = CONFIG.WIDO_CONTRACTS[network]["CROSS_CHAIN_ORDER"];

    const payload = {
      network,
      tokenAddress,
      spenderAddress,
      vault_action_type: "CROSS_CHAIN_ORDER",
    };

    dispatch(approve(payload));
  }, [dispatch, network, fromAsset]);

  const handleSubmit = useCallback(async () => {
    // if (!parsedAmount.gt(0)) {
    //   setInputHelper("Amount should be greater than 0.");
    //   return;
    // } else if (parsedAmount.gt(balance)) {
    //   setInputHelper("Amount should not exceed your balance.");
    //   return;
    // }

    if (!toAsset || !fromAsset) return;

    const amount = parsedAmount.toString();

    try {
      await dispatch(
        crossChainOrder({
          fromNetwork: getNetwork(fromAsset.chain_id),
          fromTokenAddress: fromAsset.address,
          toNetwork: getNetwork(toAsset.chain_id),
          toTokenAddress: toAsset.address,
          amount,
          onTxHash: (txHash) => {
            setTxState("pending");
            setTxHash(txHash);
          },
        })
      ).unwrap();
      setTxState("success");
    } catch (err) {
      setTxState("failed");
    }
  }, [
    // setInputHelper,
    // balance,
    parsedAmount,
    dispatch,
    // analytics,
    fromAsset,
    toAsset,
  ]);

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          my: 4,
        }}
      >
        <BootstrapDialogTitle id="wido-swap">Wido Router</BootstrapDialogTitle>
        <DialogContent>
          <Stack>
            {txState === "success" && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                <AlertTitle>Success!</AlertTitle>
                The first transaction has been processed successfully.{" "}
                <i>
                  {formatAsNumber(inputAmount)} {fromAsset?.symbol}
                </i>{" "}
                has been routed to {chainIdMapping[toAsset?.chain_id]}. You will
                be receiving {toAsset?.symbol} in your wallet in the next few
                minutes.{" "}
                <SafeLink
                  href={`${getNetworkExplorerURLFromName(
                    network
                  )}/tx/${txHash}`}
                >
                  Open on Block Explorer.
                </SafeLink>
              </Alert>
            )}
            {txState === "pending" && (
              <LoadingIndicator
                sx={{ paddingY: 10 }}
                label={
                  <Stack alignItems="center">
                    <span>Waiting for the transaction to be processed...</span>
                    <SafeLink
                      href={`${getNetworkExplorerURLFromName(
                        network
                      )}/tx/${txHash}`}
                    >
                      Open on Block Explorer.
                    </SafeLink>{" "}
                  </Stack>
                }
              />
            )}
            {txState !== "pending" && (
              <>
                <AssetPicker
                  label="From"
                  value={fromAsset}
                  onChange={setFromAsset}
                  tokens={tokens}
                  showOwnedOnly
                  assets={vaults}
                  chainMap={chainMap}
                />
                <Box
                  sx={{
                    marginTop: 1.5,
                    marginBottom: -1.5,
                    alignSelf: "center",
                  }}
                >
                  <IconButton sx={{ transform: "rotate(90deg)" }}>
                    <CompareArrowsRounded />
                  </IconButton>
                </Box>
                <AssetPicker
                  label="To"
                  value={toAsset}
                  onChange={setToAsset}
                  tokens={tokens}
                  assets={vaults}
                  chainMap={chainMap}
                />
                <AmountInput
                  symbol={fromAsset?.symbol}
                  decimals={fromAsset?.decimals}
                  balance={balance}
                  helper={inputHelper}
                  setInputHelper={setInputHelper}
                  amount={inputAmount}
                  setInputAmount={setInputAmount}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {!isWalletConnected ? (
            <LoadingButton
              loading={isWalletConnecting}
              variant="contained"
              onClick={handleConnectWalletClick}
              sx={{ margin: "0 auto", width: 280, textTransform: "none" }}
              label="Connect wallet"
              loadingLabel="Connecting wallet"
            />
          ) : (
            <>
              {txState !== "pending" && (
                <LoadingButton
                  disabled={
                    !selectionReady || !parsedAmount.gt(0) || alreadyApproved
                  }
                  loading={isApproving}
                  variant="contained"
                  fullWidth
                  onClick={handleApprove}
                  loadingLabel="Approving"
                  label={
                    !selectionReady
                      ? "Select an asset"
                      : !parsedAmount.gt(0)
                      ? "Enter an amount"
                      : alreadyApproved
                      ? "Approve (done)"
                      : "Approve"
                  }
                  sx={{ textTransform: "none" }}
                />
              )}
              {selectionReady &&
                parsedAmount.gt(0) &&
                txState !== "pending" && (
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    disabled={
                      inputAmount === "" ||
                      userTokenAllowance.lt(parsedAmount) ||
                      balance.eq(0)
                    }
                    loading={isSigning}
                    onClick={handleSubmit}
                    label="Route"
                    loadingLabel="Routing"
                    sx={{ textTransform: "none" }}
                  />
                )}
            </>
          )}
        </DialogActions>
      </Paper>

      <Box mb={8}>
        <Typography gutterBottom variant="subtitle2" px={2}>
          FAQs
        </Typography>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What is Wido Router</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Wido Router was built as part of HackMoney 2022 and you can find
              the project submission{" "}
              <SafeLink
                href="https://showcase.ethglobal.com/hackmoney2022/wido-swap-7wvas"
                title="Wido Router project submission on HackMoney 2022"
              >
                here
              </SafeLink>
              .
            </Typography>
            <Typography gutterBottom>
              Wido Router lets users move liquidity from anywhere to anywhere,
              cross chain, cross protocol, cross layer-twos. Initially, we
              integrated Ethereum, Avalanche and Fantom. It can be extended to
              anything.
            </Typography>
            <Typography gutterBottom>
              Wido Router enables cross-chain deposits and withdrawals for the
              first time. It allows users to deposit tokens like USDC or DAI
              from source chain into a vault or farm on a different chain,
              without the need to own destination chain tokens to pay for gas.
              It bundles multiple transactions behind the scenes, making it
              seamless for the user.
            </Typography>
            <Typography gutterBottom>
              It allows withdrawals from vaults on chain A into a different
              chain. For example, with Wido Router, you can withdraw USDC from a
              yearn.finance vault on Ethereum into a Fantom wallet, all in a
              single transaction. No need to to worry about finding a bridge,
              bridging etc.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>How does Wido Router work</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Wido Router consists of separate smart contracts on each chain
              supported. The routing system is extensible to any chain or
              protocol. For the HackMoney Hackathon, we integrated it with
              Ethereum, Avalanche and Fantom.
            </Typography>
            <Typography gutterBottom>
              Wido Router contracts use LayerZero behind the scenes to handle
              cross-chain messaging. It uses StargateFinance to bridge funds
              across chains.
            </Typography>
            <Typography gutterBottom>
              Wido Router contracts also use an off-chain component which
              chooses the optimal path for the token swaps to ensure the lowest
              slippage. We plan to make it public using IPFS.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What is Wido Router Widget</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              Wido Router Widget is a bundable version of Wido Router that
              developers can inject into their DAPPs.
            </Typography>
            <Typography gutterBottom>
              You can see it live on the{" "}
              <SafeLink
                href="https://showcase.ethglobal.com/hackmoney2022/wido-swap-7wvas"
                title="Wido Router submission on HackMoney 2022"
              >
                HackMoney submission video
              </SafeLink>
              . Jump to 2:42 minute to see Wido Router Widget in action.
            </Typography>
            <Typography gutterBottom>
              We are currently preparing docs and integration guides for
              developers to leverage Wido Router Widget in their UI.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>What are the next plans with Wido Router</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography gutterBottom>
              First, we plan to integrate Wido Router with a few selected
              partners. After that, we plan to decentralise Wido Router so that
              anyone can use it and contribute to it.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Are Wido Router contracts audited</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>Not yet. Use at your own risk.</Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>Who is behind Wido</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>
              Learn about us{" "}
              <SafeLink
                href="https://www.joinwido.com/about"
                title="here"
                underline="always"
              >
                here
              </SafeLink>{" "}
              and feel free to{" "}
              <SafeLink
                href="https://www.joinwido.com/contact"
                title="reach out"
                underline="always"
              >
                reach out
              </SafeLink>
              !
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Footer />
    </Box>
  );
}
