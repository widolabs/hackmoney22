import React, { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Container,
  CardHeader,
  lighten,
  alpha,
  darken,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ArrowBackRounded } from "@mui/icons-material";
//
import WidoAppBar from "../../app/AppBar";
import { useAppSelector } from "../../state/store";
import useElementSizeDebounced from "../../hooks/useElementSizeDebounced";
import { VaultChart } from "./VaultChart";
import { PnLSimulator } from "./PnLSimulator";
import { VaultBalance } from "./VaultBalance";
import { VaultDetailCard } from "./VaultDetailCard";
import { GasSavingsAlert } from "./GasSavingsAlert";
import { RouteFallback } from "../../components/RouteFallback";

export const CardHeaderStyled = styled(CardHeader)(({ theme }) => ({
  borderBottom: `1px solid ${
    theme.palette.mode === "light"
      ? lighten(alpha(theme.palette.divider, 1), 0.88)
      : darken(alpha(theme.palette.divider, 1), 0.68)
  }`,
  marginBottom: theme.spacing(1),
}));

export default function VaultDetailPage() {
  const navigate = useNavigate();
  const urlParams = useParams();

  const { vaultAddress = "" } = urlParams;
  const chainId = parseInt(urlParams.chainId || "-1");

  const vault = useAppSelector((state) =>
    state.vault.vaultList.find(
      (element) =>
        element.address.toLowerCase() === vaultAddress.toLowerCase() &&
        element.chain_id === chainId
    )
  );

  useEffect(() => {
    if (!vault) return;
    document.title = `Wido - ${vault.display_name}`;
  }, [vault]);

  const pagesVisited = useAppSelector((state) => state.app.pagesVisited);

  const handleNavBackClick = useCallback(() => {
    // if the previous page is the vault list, we navigate(-1)
    // to preserve scroll state & url params (filter data)
    if (pagesVisited[pagesVisited.length - 2] === "/") {
      navigate(-1);
    } else {
      navigate("/");
    }
  }, [navigate, pagesVisited]);

  const [appbarRef, { height: appbarHeight }] = useElementSizeDebounced();

  if (!vault) {
    return <RouteFallback message="Vault not found." />;
  }

  return (
    <Box
      sx={(theme) => ({
        flexGrow: 1,
        overflowX: "hidden",
        [theme.breakpoints.up("xl")]: {
          paddingRight: `${theme.wido.filterDrawerWidthXL}px`,
        },
      })}
    >
      <WidoAppBar
        ref={appbarRef}
        onIconClick={handleNavBackClick}
        icon={<ArrowBackRounded />}
        iconAlwaysVisible
        title="Vault detail"
      />
      <Container
        component="main"
        sx={{
          paddingTop: 2,
          paddingBottom: 2,
          marginTop: `${appbarHeight}px}`,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <GasSavingsAlert vault={vault} />
          </Grid>
          <Grid item xs={12}>
            <VaultBalance vault={vault} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <VaultDetailCard vault={vault} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <VaultChart vault={vault} />
          </Grid>
          <Grid item xs={12}>
            {vault.chain_id == 1 && <PnLSimulator vault={vault} />}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
