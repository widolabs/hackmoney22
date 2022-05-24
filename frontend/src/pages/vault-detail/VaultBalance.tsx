import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddRounded,
  ArrowDownwardRounded,
  ArrowForwardRounded,
  ErrorRounded,
} from "@mui/icons-material";
import { Paper, Stack, Typography } from "@mui/material";
import { ErrorBoundary } from "@sentry/react";
import { Button } from "../../components/Button";
import { Link } from "../../components/Link";
import { SafeLink } from "../../components/SafeLink";
import WidoTogetherDialog from "../../components/WidoTogetherDialog";
import { walletSelect } from "../../state/reducers/currentUserSlice";
import { getTokensDetails } from "../../utils/utils";
import { useAppSelector, useAppDispatch } from "../../state/store";
import { getNetwork } from "../../utils/network";
import { useAnalytics } from "../../hooks/useAnalytics";
import { Vault, VaultActionType } from "../../state/apiSlice";
import { useFetchVaultDetailQuery } from "../../state/apiSlice";
import { VaultIcon } from "../../components/VaultIcon";
import OldLabel from "../../components/OldLabel";
import {
  DEPOSIT_KEY,
  getChainLabel,
  MIGRATION_KEY,
  WIDO_TOGETHER_LABEL,
  WITHDRAW_KEY,
} from "../../utils/label";
import { ethers } from "ethers";
import {
  getUserTokens,
  selectTokenBalance,
} from "../../state/reducers/tokenSlice";
import ContentLoader from "react-content-loader";
import { Number } from "../../components/Number";
import { getVaultTxSupport } from "../../utils/wido_together";

type VaultBalanceProps = {
  vault: Vault;
};

const DIALOG_TYPE: Record<string, VaultActionType> = {
  // TODO: use VaultActionType in apiSlice.ts instead
  WITHDRAW: "WITHDRAW",
  SWAP: "SWAP",
  DEPOSIT: "DEPOSIT",
};

const WidoTogetherLoader = () => (
  <ContentLoader width={448} height={42} viewBox="0 0 448 42">
    <rect x="0" y="0" rx="4" ry="4" width="220" height="42" />
    <rect x="228" y="0" rx="4" ry="4" width="220" height="42" />
  </ContentLoader>
);

export function VaultBalance(props: VaultBalanceProps) {
  const { vault } = props;
  const analytics = useAnalytics();
  const dispatch = useAppDispatch();

  const isWalletConnected = useAppSelector(
    (state) => state.currentUser.isConnected
  );
  const tokenListData = useAppSelector((state) => state.tokenList.tokens);

  const {
    data: vaultDetails,
    isSuccess,
    isLoading,
  } = useFetchVaultDetailQuery(vault);

  const [isWidoTogetherOpen, setIsWidoTogetherOpen] = useState(false);
  const [widoTogetherDialogType, setWidoTogetherDialogType] = useState("");
  const network = getNetwork(vault.chain_id);

  const handleWidoTogetherClick = useCallback(
    async (type: VaultActionType) => {
      analytics?.track(`${type.toLowerCase()}_dialog_open`, {
        vault_address: vault.address,
        vault_tx_support: getVaultTxSupport(vault, type),
      });

      setWidoTogetherDialogType(type);
      setIsWidoTogetherOpen(true);
    },
    [analytics, vault, setWidoTogetherDialogType, setIsWidoTogetherOpen]
  );

  const handleWidoTogetherClickClose = (type: VaultActionType) => {
    analytics?.track(`${type.toLowerCase()}_dialog_close`, {
      vault_address: vault.address,
    });

    setIsWidoTogetherOpen(false);
  };

  useEffect(() => {
    if (isWalletConnected) {
      dispatch(getUserTokens({ network, addresses: [vault.address] }));
    }
  }, [isWalletConnected, dispatch, network, vault.address]);

  let vaultWithdrawalTokens: string[] = [];
  if (isSuccess) {
    vaultWithdrawalTokens = getTokensDetails(
      vaultDetails.deposit_token,
      tokenListData[vault.chain_id]
    ) as string[];
  }

  let dialogFragment: JSX.Element | null = null;

  const protocolLabel = vault.provider;
  const chainLabel = getChainLabel(vault.chain_id);

  const userTokenBalance = useAppSelector(
    selectTokenBalance(network, vault.address)
  );

  if (isWidoTogetherOpen && widoTogetherDialogType === DIALOG_TYPE.WITHDRAW) {
    dialogFragment = (
      <WidoTogetherDialog
        type={DIALOG_TYPE.WITHDRAW}
        network={network}
        chainLabel={chainLabel}
        protocolLabel={protocolLabel}
        isOpen={isWidoTogetherOpen}
        fromTokens={[
          {
            address: vault.address,
            symbol: vault.symbol,
            name: vault.display_name,
            decimals: vault.decimals,
            logoURI: vault.icon,
          },
        ]}
        toTokens={vaultWithdrawalTokens}
        onClose={() => handleWidoTogetherClickClose(DIALOG_TYPE.WITHDRAW)}
        vaultUrl={`/vault/${vault.address}/${vault.chain_id}`}
        unsupported={!vault.wido_together.includes(WITHDRAW_KEY)}
        title={WIDO_TOGETHER_LABEL[vault.chain_id][WITHDRAW_KEY]}
      />
    );
  } else if (
    isWidoTogetherOpen &&
    widoTogetherDialogType === DIALOG_TYPE.DEPOSIT
  ) {
    dialogFragment = (
      <WidoTogetherDialog
        type={DIALOG_TYPE.DEPOSIT}
        network={network}
        chainLabel={chainLabel}
        protocolLabel={protocolLabel}
        isOpen={isWidoTogetherOpen}
        fromTokens={vaultWithdrawalTokens}
        toTokens={[
          {
            address: vault.address,
            symbol: vault.symbol,
            name: vault.display_name,
            decimals: vault.decimals,
            logoURI: vault.icon,
          },
        ]}
        onClose={() => handleWidoTogetherClickClose(DIALOG_TYPE.DEPOSIT)}
        vaultUrl={`/vault/${vault.address}/${vault.chain_id}`}
        unsupported={!vault.wido_together.includes(DEPOSIT_KEY)}
        title={WIDO_TOGETHER_LABEL[vault.chain_id][DEPOSIT_KEY]}
      />
    );
  } else if (
    isWidoTogetherOpen &&
    widoTogetherDialogType === DIALOG_TYPE.SWAP
  ) {
    dialogFragment = (
      <WidoTogetherDialog
        type={DIALOG_TYPE.SWAP}
        network={network}
        chainLabel={chainLabel}
        protocolLabel={protocolLabel}
        isOpen={isWidoTogetherOpen}
        fromTokens={[
          {
            address: vault.address,
            symbol: vault.symbol,
            name: vault.display_name,
            decimals: vault.decimals,
            logoURI: vault.icon,
          },
        ]}
        toTokens={[
          {
            address: vaultDetails.migration_address,
            symbol: vault.symbol,
            name: vault.display_name,
            decimals: vault.decimals,
            logoURI: vault.icon,
          },
        ]}
        onClose={() => handleWidoTogetherClickClose(DIALOG_TYPE.SWAP)}
        vaultUrl={`/vault/${vault.address}/${vault.chain_id}`}
        unsupported={!vault.wido_together.includes(MIGRATION_KEY)}
        title={WIDO_TOGETHER_LABEL[vault.chain_id][MIGRATION_KEY]}
      />
    );
  }

  const dialogFallback = useMemo(
    () => (
      <>
        <Stack spacing={1} marginTop={2} direction="row">
          <ErrorRounded color="secondary" />
          <Typography>
            Loading Wido gasless transactions failed.
            {" Try "}
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                window.location.reload();
              }}
            >
              refreshing
            </Link>
            {" or "}
            <SafeLink href="https://www.joinwido.com/contact">
              reach out to us.
            </SafeLink>
          </Typography>
        </Stack>
      </>
    ),
    []
  );

  return (
    <Paper elevation={21} sx={{ padding: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={3}
      >
        <Stack direction="row" alignItems="center" gap={1} flex="1">
          <VaultIcon
            size="large"
            icons={vault.icon}
            iconImageAlt={vault.display_name}
          />
          <Stack>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ display: "flex", alignItems: "center", marginBottom: 0.5 }}
            >
              {vault.display_name}
              {vault.wido_together.includes(MIGRATION_KEY) && (
                <OldLabel sx={{ marginLeft: 0.5 }} />
              )}
            </Typography>
            {!isWalletConnected && (
              <Typography variant="caption">
                <Link
                  color="inherit"
                  href="#"
                  onClick={(event) => {
                    // Link's href is pointing to a fake anchor, causing the page to scroll up, unless we prevent the default
                    event.preventDefault();
                    dispatch(
                      walletSelect({ source: "connect_to_see_balance" })
                    );
                  }}
                >
                  Connect wallet to see your balance.
                </Link>
              </Typography>
            )}
            {isWalletConnected && (
              <Typography variant="body2">
                Balance{" "}
                <Number>
                  {ethers.utils.formatUnits(userTokenBalance, vault.decimals)}{" "}
                  {vault.symbol}
                </Number>
              </Typography>
            )}
            {/* <Typography variant="body2" noWrap>
              Value <Monospace>≈ $1 000 000</Monospace> USD
            </Typography> */}
          </Stack>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={(theme) => ({
            [theme.breakpoints.down("md")]: {
              justifyContent: "center",
            },
          })}
        >
          {isSuccess && (
            <>
              <Button
                size="large"
                variant="contained"
                color="tertiary"
                sx={({ shape }) => ({ borderRadius: shape.borderRadiusFab })}
                onClick={() => handleWidoTogetherClick(DIALOG_TYPE.WITHDRAW)}
                startIcon={<ArrowDownwardRounded />}
              >
                {WIDO_TOGETHER_LABEL[vault.chain_id][WITHDRAW_KEY]}
              </Button>
              {!vault.wido_together.includes(MIGRATION_KEY) && (
                <Button
                  size="large"
                  variant="contained"
                  sx={({ shape }) => ({ borderRadius: shape.borderRadiusFab })}
                  onClick={() => handleWidoTogetherClick(DIALOG_TYPE.DEPOSIT)}
                  startIcon={<AddRounded />}
                >
                  {WIDO_TOGETHER_LABEL[vault.chain_id][DEPOSIT_KEY]}
                </Button>
              )}
              {vault.wido_together.includes(MIGRATION_KEY) && (
                <Button
                  size="large"
                  variant="contained"
                  sx={({ shape }) => ({ borderRadius: shape.borderRadiusFab })}
                  onClick={() => handleWidoTogetherClick(DIALOG_TYPE.SWAP)}
                  startIcon={<ArrowForwardRounded />}
                >
                  {WIDO_TOGETHER_LABEL[vault.chain_id][MIGRATION_KEY]}
                </Button>
              )}
            </>
          )}
          {isLoading && <WidoTogetherLoader />}
          <ErrorBoundary fallback={dialogFallback}>
            {dialogFragment}
          </ErrorBoundary>
        </Stack>
      </Stack>
    </Paper>
  );
}
