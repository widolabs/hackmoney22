import React, { useMemo } from "react";

import { Card, Stack, Typography } from "@mui/material";
import {
  walletDisconnect,
  walletSelect,
} from "../state/reducers/currentUserSlice";

import Logo from "../components/Logo";
import { useAppSelector, useAppDispatch } from "../state/store";
import { LoadingButton } from "../components/Button";
import { ErrorBoundary } from "@sentry/react";
import { ErrorRounded } from "@mui/icons-material";
import { SafeLink } from "../components/SafeLink";
import { Link } from "../components/Link";
import UserProfileSmall from "../components/UserProfileSmall";

export function TopPanel() {
  const { isLoading, isConnected, selectedAddress } = useAppSelector(
    (state) => state.currentUser
  );

  const dispatch = useAppDispatch();

  const handleConnectWalletClick = async () => {
    await dispatch(walletSelect({ source: "sidepanel_connect_wallet" }));
  };

  const handleDisconnectWalletClick = async () => {
    await dispatch(walletDisconnect());
  };

  const userProfileFallback = useMemo(
    () => (
      <Card variant="outlined" sx={{ margin: 2 }}>
        <Stack spacing={1} margin={2} direction="row">
          <ErrorRounded color="secondary" />
          <Typography>
            Connecting your wallet failed.
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
      </Card>
    ),
    []
  );

  return (
    <Stack direction="row" justifyContent="space-between" margin={2}>
      <Logo />
      {!isConnected && (
        <LoadingButton
          size="small"
          variant="outlined"
          onClick={handleConnectWalletClick}
          loading={isLoading}
          label="Connect wallet"
          loadingLabel="Connecting wallet"
        />
      )}
      {isConnected && (
        <ErrorBoundary fallback={userProfileFallback}>
          <UserProfileSmall
            walletAddress={selectedAddress}
            onDisconnectWalletClick={handleDisconnectWalletClick}
          />
        </ErrorBoundary>
      )}
    </Stack>
  );
}
