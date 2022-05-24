import React, { useCallback, useState, useEffect } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { ethers } from "ethers";
import { useAnalytics } from "../hooks/useAnalytics";

import {
  Avatar,
  Stack,
  FormControl,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ButtonGroup,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Box,
  FormHelperText,
  Divider,
  DialogActions,
  DialogTitleProps,
  Alert,
  AlertTitle,
} from "@mui/material";

import {
  useFetchTransactionQueueQuery,
  VaultActionType,
} from "../state/apiSlice";
import { shortenWalletAddress } from "../utils/utils";
import {
  ArrowDownward,
  ArrowDownwardRounded,
  ArrowForwardRounded,
  AddRounded,
  CloseRounded,
} from "@mui/icons-material";
import {
  approve,
  getUserTokens,
  getTokenAllowance,
  permit,
  selectTokenBalance,
} from "../state/reducers/tokenSlice";
import {
  batchDeposit,
  batchSwap,
  batchWithdraw,
  gaslessOrder,
  NetworkName,
} from "../state/reducers/widoSlice";
import config from "../config";

import { isEmpty } from "lodash";

import OldLabel from "./OldLabel";
import { Button, LoadingButton } from "./Button";
import { useAppDispatch, useAppSelector } from "../state/store";
import { FeeBreakdown } from "./FeeBreakdown";
import { SafeLink } from "./SafeLink";
import { LoadingIndicator } from "./LoadingIndicator";
import { getNetworkExplorerURLFromName, getNetworkId } from "../utils/network";
import { Token } from "../state/reducers/tokenListSlice";
import { hasBatchTx } from "../utils/wido_together";
import { walletSelect } from "../state/reducers/currentUserSlice";

export const BootstrapDialogTitle = (
  props: DialogTitleProps & { onClose?: () => void }
) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle
      sx={{ padding: 2, display: "flex", justifyContent: "space-between" }}
      {...other}
    >
      {children}
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          edge="end"
          sx={{ marginY: -0.5 }}
        >
          <CloseRounded />
        </IconButton>
      )}
    </DialogTitle>
  );
};

const LABELS_BY_TYPE = {
  WITHDRAW: {
    buttonLabel: "Withdraw",
    buttonIcon: <ArrowDownwardRounded />,
    buttonLoadingLabel: "Withdrawing",
    fromTokenLabel: "From Vault",
    toTokenLabel: "Withdrawal Token",
    amountLabel: "Withdrawal amount",
    pendingAction: "withdrawal",
    success: "withdrawn",
  },
  DEPOSIT: {
    buttonLabel: "Deposit",
    buttonIcon: <AddRounded />,
    buttonLoadingLabel: "Depositing",
    fromTokenLabel: "Deposit Token",
    toTokenLabel: "To Vault",
    amountLabel: "Deposit amount",
    pendingAction: "deposit",
    success: "deposited",
  },
  SWAP: {
    buttonLabel: "Migrate",
    buttonIcon: <ArrowForwardRounded />,
    buttonLoadingLabel: "Migrating",
    fromTokenLabel: "From Vault",
    toTokenLabel: "To Vault",
    amountLabel: "Migration amount",
    pendingAction: "migration",
    success: "migrated",
  },
};

export type WidoTogetherFormProps = {
  title: string;
  type: VaultActionType;
  network: NetworkName;
  chainLabel: string;
  protocolLabel: string;
  onClose?: () => void;
  fromTokens: Token[];
  toTokens: Token[];
  vaultUrl: string;
  unsupported: boolean;
};

type TxState = "none" | "pending" | "success" | "failed";

function getInfoMessage(
  network: NetworkName,
  type: VaultActionType,
  feeTokenSymbol: string
) {
  if (network === "fantom" && type === "DEPOSIT") {
    return "Your deposit transaction will be executed immediately after you Approve and Deposit. Wido will cover full gas price, no FTM tokens needed.";
  }
  if (network === "fantom" && type === "WITHDRAW") {
    return "Your withdraw transaction will be executed immediately after you Approve and Withdraw. Wido will cover the withdraw gas fee.";
  }
  if (hasBatchTx(network)) {
    const action =
      type === "DEPOSIT"
        ? "Deposit"
        : type === "WITHDRAW"
        ? "Withdraw"
        : "Migrate";

    return (
      <>
        Your {action.toLowerCase()} transaction will be added to a batch after
        you Approve and {action}. Wido will execute the batch in the next 7 days
        during low gas period (usually on weekends). Gas will be paid in{" "}
        {feeTokenSymbol} and split evenly across all batch participants. Wido
        does not charge any extra fees for batch transactions.{" "}
        <SafeLink href="https://www.joinwido.com/wido-together">
          Learn how it works.
        </SafeLink>
      </>
    );
  }

  return "";
}

export default function WidoTogetherForm(props: WidoTogetherFormProps) {
  const handleClose = props.onClose;
  // TODO: Remove chainLabel is instead use `network` to derive it.
  const {
    title,
    type,
    network,
    fromTokens,
    toTokens,
    chainLabel,
    protocolLabel,
    vaultUrl,
    unsupported,
  } = props;
  const labels = LABELS_BY_TYPE[type];
  const tokenListData = useAppSelector((state) => state.tokenList.tokens);

  const isWalletConnected = useAppSelector(
    (state) => state.currentUser.isConnected
  );
  const isWalletConnecting = useAppSelector(
    (state) => state.currentUser.isLoading
  );

  const [selectedFromToken, setSelectedFromToken] = useState(fromTokens[0]);
  const [selectedToToken, setSelectedToToken] = useState(toTokens[0]);
  const [inputAmount, setInputAmount] = useState("");
  const [inputHelper, setInputHelper] = useState("");

  const parsedAmount = ethers.utils.parseUnits(
    inputAmount === "" ? "0" : inputAmount,
    selectedFromToken.decimals
  );

  const [txState, setTxState] = useState<TxState>("none");
  const [txHash, setTxHash] = useState<string>();

  const dispatch = useAppDispatch();
  const analytics = useAnalytics();

  const userAddress = useAppSelector(
    (state) => state.currentUser.selectedAddress
  );

  useEffect(() => {
    if (unsupported) return;

    dispatch(
      getUserTokens({ network, addresses: [selectedFromToken.address] })
    );
    dispatch(
      getTokenAllowance({
        network,
        tokenAddress: selectedFromToken.address,
        spenderAddress: config.WIDO_CONTRACTS[network][type],
      })
    );
  }, [
    unsupported,
    dispatch,
    network,
    selectedFromToken.address,
    type,
    userAddress,
  ]);

  const handleConnectWalletClick = useCallback(async () => {
    await dispatch(walletSelect({ source: "wido_together_dialog" }));
  }, [dispatch]);

  const isSigning = useAppSelector(
    (state) => state.wido.user.userActionsMap.isSigning
  );
  const isApproving = useAppSelector(
    (state) =>
      state.token.user.userTokensActionsMap[network][selectedFromToken.address]
        ?.isApproving ?? false
  );
  const userTokenBalance = useAppSelector(
    selectTokenBalance(network, selectedFromToken.address)
  );
  const userTokenAllowance = useAppSelector((state) => {
    const tokenAllowance =
      state.token.user.userTokensAllowancesMap[network][
        selectedFromToken.address
      ];
    return ethers.BigNumber.from(
      tokenAllowance ? tokenAllowance[config.WIDO_CONTRACTS[network][type]] : 0
    );
  });

  const { data: vaultQueue, isSuccess: isVaultQueueLoaded } =
    useFetchTransactionQueueQuery(
      {
        type,
        fromTokenAddress: selectedFromToken.address,
        toTokenAddress: selectedToToken.address,
      },
      {
        skip: unsupported || (network !== "mainnet" && network !== "phuture"),
      }
    );

  const setAmountFromPercentage = useCallback(
    (percent: number) => {
      setInputAmount(
        ethers.utils.formatUnits(
          userTokenBalance.mul((percent * 100).toFixed()).div(100),
          selectedFromToken.decimals
        )
      );
    },
    [setInputAmount, userTokenBalance, selectedFromToken]
  );

  const handleSubmit = useCallback(async () => {
    if (!parsedAmount.gt(0)) {
      setInputHelper("Amount should be greater than 0.");
      return;
    } else if (parsedAmount.gt(userTokenBalance)) {
      setInputHelper("Amount should not exceed your balance.");
      return;
    } else if (
      type === "DEPOSIT" &&
      ethers.BigNumber.from("100000000").gt(parsedAmount)
    ) {
      setInputHelper(
        `Deposit amount should be at least 100 ${selectedFromToken.symbol}`
      );
      return;
    }

    const fromTokenAddress = selectedFromToken.address;
    const toTokenAddress = selectedToToken.address;
    const amount = parsedAmount.toString();

    const analyticsPayload = {
      type,
      network,
      fromTokenAddress: selectedFromToken.address,
      toTokenAddress: selectedToToken.address,
      amount,
    };
    analytics?.track("order_init", analyticsPayload);

    try {
      if (network === "mainnet" || network == "phuture") {
        if (type === "WITHDRAW") {
          await dispatch(
            batchWithdraw({
              network,
              vaultAddress: fromTokenAddress,
              tokenAddress: toTokenAddress,
              amount,
            })
          ).unwrap();
        } else if (type === "DEPOSIT") {
          await dispatch(
            batchDeposit({
              network,
              tokenAddress: fromTokenAddress,
              vaultAddress: toTokenAddress,
              amount,
            })
          ).unwrap();
        } else if (type === "SWAP") {
          await dispatch(
            batchSwap({
              network,
              fromVaultAddress: fromTokenAddress,
              toVaultAddress: toTokenAddress,
              amount,
            })
          ).unwrap();
        }
      } else if (network === "fantom" || network === "avalanche") {
        await dispatch(
          gaslessOrder({
            network,
            fromTokenAddress,
            toTokenAddress,
            amount,
            onTxHash: (txHash) => {
              setTxState("pending");
              setTxHash(txHash);
            },
          })
        ).unwrap();
      }

      analytics?.track("order_approved", analyticsPayload);

      setTxState("success");
    } catch (error) {
      if (error instanceof Error) {
        if (
          [
            "MetaMask Message Signature: User denied message signature.",
            "MetaMask Tx Signature: User denied transaction signature.",
          ].includes(error.message)
        ) {
          analytics?.track("order_rejected", analyticsPayload);
        }
      }

      setTxState("failed");
    }
  }, [
    setInputHelper,
    userTokenBalance,
    analytics,
    dispatch,
    selectedFromToken,
    parsedAmount,
    network,
    type,
    selectedToToken,
  ]);

  const handleApprove = useCallback(() => {
    const { NETWORK_SETTINGS } = config;
    const { permitEnabledTokens } = NETWORK_SETTINGS[network];
    const tokenAddress = selectedFromToken.address;
    const spenderAddress = config.WIDO_CONTRACTS[network][type];

    const payload = {
      network,
      tokenAddress,
      spenderAddress,
      vault_action_type: type,
    };

    if (permitEnabledTokens.includes(tokenAddress)) {
      dispatch(permit(payload));
    } else {
      dispatch(approve(payload));
    }
  }, [dispatch, network, selectedFromToken.address, type]);

  if (
    isEmpty(tokenListData) || // tokenListData is an object, needs different check
    fromTokens.length === 0 ||
    toTokens.length === 0
  ) {
    return <Typography>Loading...</Typography>;
  }

  let queueElement = <Typography gutterBottom>Fetching queue size</Typography>;

  if (isVaultQueueLoaded && vaultQueue) {
    const userLabel =
      vaultQueue.pending_txs.length === 1 ? "user is" : "users are";

    queueElement = (
      <Box sx={{ marginTop: 2, paddingX: 1.5 }}>
        <Typography gutterBottom variant="body2">
          {type === "DEPOSIT" &&
            `Currently, ${vaultQueue.pending_txs.length} ${userLabel} waiting to
            deposit ${selectedFromToken.name} into the ${selectedToToken.name} vault.`}
          {type === "WITHDRAW" &&
            `Currently, ${vaultQueue.pending_txs.length} ${userLabel} waiting to
            withdraw ${selectedToToken.name} from the ${selectedFromToken.name} vault.`}
          {type === "SWAP" &&
            `Currently, ${vaultQueue.pending_txs.length} ${userLabel} waiting to
            migrate ${selectedFromToken.name} from ${selectedFromToken.name} to the ${selectedToToken.name} vault.`}{" "}
          Share <SafeLink href={vaultUrl}>link to this vault</SafeLink> to let
          others join. More people = more savings.
        </Typography>
        <List dense={true}>
          {vaultQueue.pending_txs.map((item, index) => (
            <ListItem key={index} disableGutters>
              <ListItemAvatar>
                <Avatar src={item.profile_pic}></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`Amount: $${item.display_amount}`}
                secondary={shortenWalletAddress(item.user)}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  const approvalTooSmall = !userTokenAllowance.gt(parsedAmount);
  const alreadyApproved = userTokenAllowance.gt(0) && !approvalTooSmall;

  const infoMessage = getInfoMessage(network, type, selectedToToken.symbol);

  return (
    <>
      <BootstrapDialogTitle
        id="wido-together-dialog-title"
        onClose={handleClose}
      >
        {title}
      </BootstrapDialogTitle>
      <DialogContent dividers>
        {unsupported && (
          <Alert severity="info">
            {hasBatchTx(getNetworkId(network)) ? "Gasless" : "Gas-free"}{" "}
            transactions are not supported on this vault yet.{" "}
            <SafeLink href="https://www.joinwido.com/contact">
              Reach out and we will swiftly add the support for you.
            </SafeLink>
          </Alert>
        )}
        {txState === "pending" && (
          <LoadingIndicator
            sx={{ paddingY: 10 }}
            label="Waiting for the transaction to be processed..."
          />
        )}
        {txState === "success" && (
          <Alert severity="success" sx={{ marginBottom: 2 }}>
            <AlertTitle>Success!</AlertTitle>
            {network === "fantom" && (
              <>
                Successfully {labels.success} {inputAmount}{" "}
                {selectedFromToken.name} into {selectedToToken.name}.{" "}
                <SafeLink
                  href={`${getNetworkExplorerURLFromName(
                    network
                  )}/tx/${txHash}`}
                >
                  Open on Block Explorer.
                </SafeLink>{" "}
                Wido covered full gas price.
              </>
            )}
            {(network === "mainnet" || network === "phuture") && (
              <>
                Your {labels.pendingAction} of {inputAmount}{" "}
                {selectedFromToken.name} ({selectedFromToken.symbol}) into{" "}
                {selectedToToken.name} was added to a queue. Follow{" "}
                <SafeLink href={"https://twitter.com/wido_bot"}>
                  @wido_bot on Twitter
                </SafeLink>{" "}
                to get updated when the next batch executes.
              </>
            )}
          </Alert>
        )}
        {txState === "failed" && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            <AlertTitle>Transaction failed.</AlertTitle>
            <SafeLink
              href={`${getNetworkExplorerURLFromName(network)}/tx/${txHash}`}
            >
              Open on Block Explorer.
            </SafeLink>{" "}
            Please try again or{" "}
            <SafeLink href="https://www.joinwido.com/contact">
              reach out
            </SafeLink>{" "}
            if the problem persists.
          </Alert>
        )}
        {txState !== "pending" && !unsupported && (
          <>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id="wg-from-token-label">
                {labels.fromTokenLabel}
              </InputLabel>
              <Select
                readOnly
                size="small"
                labelId="wg-from-token-label"
                id="wg-from-token-select"
                value={selectedFromToken.address}
                label={labels.fromTokenLabel}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {fromTokens.map((token, idx) => (
                  <MenuItem key={idx} value={token.address}>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          Array.isArray(token.logoURI)
                            ? token.logoURI[0]
                            : token.logoURI
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText>
                      <Stack direction="row" spacing={1}>
                        <span>{token.name}</span>
                        {type === "SWAP" && <OldLabel />}
                        {type === "DEPOSIT" && <span>({token.symbol})</span>}
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {`Chain: ${chainLabel}`}
                {["WITHDRAW", "SWAP"].includes(type)
                  ? `, Protocol ${protocolLabel}`
                  : ""}
              </FormHelperText>
            </FormControl>
            <Box sx={{ marginY: 1, textAlign: "center" }}>
              <ArrowDownward />
            </Box>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel id="wg-withdraw-token-label">
                {labels.toTokenLabel}
              </InputLabel>
              <Select
                readOnly
                size="small"
                labelId="wg-withdraw-token-label"
                id="wg-withdraw-token-select"
                value={selectedToToken.address}
                label={labels.toTokenLabel}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {toTokens.map((token, idx) => (
                  <MenuItem key={idx} value={token.address}>
                    <ListItemAvatar>
                      <Avatar
                        src={
                          Array.isArray(token.logoURI)
                            ? token.logoURI[0]
                            : token.logoURI
                        }
                      />
                    </ListItemAvatar>
                    <ListItemText>
                      <Stack direction="row" spacing={1}>
                        <span>{token.name}</span>
                        {type === "WITHDRAW" && <span>({token.symbol})</span>}
                      </Stack>
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {`Chain: ${chainLabel}`}
                {["DEPOSIT", "SWAP"].includes(type)
                  ? `, Protocol ${protocolLabel}`
                  : ""}
              </FormHelperText>
            </FormControl>

            <FormControl sx={{ marginBottom: 2 }} fullWidth>
              <TextField
                helperText={inputHelper}
                error={!!inputHelper}
                label={labels.amountLabel}
                value={inputAmount}
                sx={(theme) => ({
                  "& input": {
                    textAlign: "right",
                    ...theme.typography.number,
                    ...theme.typography.monospace,
                  },
                })}
                placeholder="0.000000"
                type="number"
                onChange={(event) => {
                  if (inputHelper) {
                    setInputHelper("");
                  }
                  setInputAmount(event.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {selectedFromToken.symbol}
                    </InputAdornment>
                  ),
                }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                flexWrap="wrap"
                marginTop={1}
                gap={1}
                sx={{
                  "& > p": { flexGrow: 9 },
                  "& > div": { flexGrow: 1, flexBasis: "200px" },
                  "& > div > button": { flexGrow: 1 },
                }}
              >
                <FormHelperText id="outlined-weight-helper-text">
                  {ethers.utils.formatUnits(
                    userTokenBalance,
                    selectedFromToken.decimals
                  )}{" "}
                  {selectedFromToken.symbol} available
                </FormHelperText>
                <ButtonGroup variant="outlined" size="small" color="secondary">
                  <Button onClick={() => setAmountFromPercentage(0.25)}>
                    25%
                  </Button>
                  <Button onClick={() => setAmountFromPercentage(0.5)}>
                    50%
                  </Button>
                  <Button onClick={() => setAmountFromPercentage(0.75)}>
                    75%
                  </Button>
                  <Button onClick={() => setAmountFromPercentage(1)}>
                    MAX
                  </Button>
                </ButtonGroup>
              </Stack>
            </FormControl>
            <FeeBreakdown
              network={network}
              type={type}
              approvalTokenSymbol={selectedFromToken.symbol}
              alreadyApproved={alreadyApproved}
              feeTokenSymbol={selectedToToken.symbol}
            />
            {infoMessage && <Alert severity="info">{infoMessage}</Alert>}

            {(network === "mainnet" || network === "phuture") && (
              <>
                <Divider sx={{ marginY: 2 }} />
                {queueElement}
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        {!isWalletConnected ? (
          <LoadingButton
            loading={isWalletConnecting}
            variant="contained"
            onClick={handleConnectWalletClick}
            sx={{ margin: "0 auto", width: 280 }}
            label="Connect wallet"
            loadingLabel="Connecting wallet"
          />
        ) : (
          <>
            <LoadingButton
              disabled={!parsedAmount.gt(0) || alreadyApproved}
              loading={isApproving}
              variant="contained"
              fullWidth
              onClick={handleApprove}
              loadingLabel="Approving"
              label={alreadyApproved ? "Approve (done)" : "Approve"}
            />

            <LoadingButton
              variant="contained"
              fullWidth
              disabled={
                inputAmount === "" ||
                userTokenAllowance.lt(parsedAmount) ||
                userTokenBalance.eq(0)
              }
              loading={isSigning}
              onClick={handleSubmit}
              label={labels.buttonLabel}
              startIcon={!isSigning && labels.buttonIcon}
              loadingLabel={labels.buttonLoadingLabel}
            />
          </>
        )}
      </DialogActions>
    </>
  );
}
