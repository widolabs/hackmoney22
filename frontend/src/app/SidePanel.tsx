import React, { useCallback, useMemo } from "react";

import Divider from "@mui/material/Divider";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  walletDisconnect,
  walletSelect,
} from "../state/reducers/currentUserSlice";

import UserProfile from "../components/UserProfile";
import EmailSignup from "../components/EmailSignup";
import { useAppSelector, useAppDispatch } from "../state/store";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useWidoTheme } from "../hooks/useWidoTheme";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { Link as RouterLink } from "react-router-dom";
import { Community } from "../components/Community";
import { BlogLinks } from "../components/BlogLinks";
import { TermsOfService } from "../components/TermsOfService";
import { LoadingButton } from "../components/Button";
import { ErrorBoundary } from "@sentry/react";
import { ErrorRounded } from "@mui/icons-material";
import { SafeLink } from "../components/SafeLink";
import { Link } from "../components/Link";
import { toggleMenu } from "../state/reducers/appSlice";
import Logo from "../components/Logo";

export function SidePanel() {
  const { isLoading, isConnected, selectedAddress } = useAppSelector(
    (state) => state.currentUser
  );

  const menuOpen = useAppSelector((state) => state.app.menuOpen);
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch(toggleMenu());
  }, [dispatch]);

  const handleConnectWalletClick = async () => {
    await dispatch(walletSelect({ source: "sidepanel_connect_wallet" }));
  };

  const handleDisconnectWalletClick = async () => {
    await dispatch(walletDisconnect());
  };

  const theme = useTheme();
  const largeDevice = useMediaQuery(theme.breakpoints.up("md"));

  const { widoTheme, toggleDarkMode } = useWidoTheme();

  const userProfileFallback = useMemo(
    () => (
      <Card variant="outlined" sx={{ margin: 3 }}>
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
    <Box
      component="nav"
      sx={(theme) => ({
        width: { md: theme.wido.menuDrawerWidth },
        flexShrink: { md: 0 },
      })}
      aria-label="side panel"
    >
      <Drawer
        variant={largeDevice ? "permanent" : "temporary"}
        open={menuOpen}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        onClose={handleClose}
        sx={(theme) => ({
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: theme.wido.menuDrawerWidth,
            zIndex: theme.wido.zIndexMenuDrawer,
          },
        })}
      >
        <Toolbar>
          <Logo />
        </Toolbar>
        <Box sx={{ overflow: "auto" }}>
          {!isConnected && (
            <Box sx={{ margin: 3 }}>
              <LoadingButton
                size="small"
                variant="outlined"
                onClick={handleConnectWalletClick}
                loading={isLoading}
                label="Connect wallet"
                loadingLabel="Connecting wallet"
              />
            </Box>
          )}
          {isConnected && (
            <ErrorBoundary fallback={userProfileFallback}>
              <UserProfile
                walletAddress={selectedAddress}
                onDisconnectWalletClick={handleDisconnectWalletClick}
              />
            </ErrorBoundary>
          )}
          <Divider />
          <BlogLinks />
          <Divider />
          <EmailSignup />
          <Divider />
          <Community />
          <Divider />
          <TermsOfService />
          {process.env.NODE_ENV === "development" && (
            <Stack
              justifyContent="flex-end"
              alignItems="flex-start"
              flexGrow={1}
              m={3}
            >
              <IconButton onClick={toggleDarkMode}>
                {widoTheme.darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
