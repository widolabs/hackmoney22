import React, { ForwardedRef, forwardRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";

import { ArrowForwardRounded, AddRounded } from "@mui/icons-material";

import {
  DEPOSIT_KEY,
  getChainLabel,
  MIGRATION_KEY,
  WIDO_TOGETHER_LABEL,
} from "../../utils/label";
import { formatAsPercentage, formatAsShortNumber } from "../../utils/number";

import { Vault } from "../../state/apiSlice";

import OldLabel from "../../components/OldLabel";
import { Button } from "../../components/Button";
import { patchLastGenericFilterList } from "../../state/reducers/vaultSlice";
import { useAppDispatch, useAppSelector } from "../../state/store";
import CONFIG from "../../config";
import { VaultIcon } from "../../components/VaultIcon";
import { NetworkChip } from "../../components/NetworkChip";
import { getNetwork } from "../../utils/network";
import { Number } from "../../components/Number";
import { ethers } from "ethers";
import { selectTokenBalance } from "../../state/reducers/tokenSlice";

export type VaultProps = {
  data: Vault;
};

type RefType = ForwardedRef<HTMLDivElement>;

const Vault = forwardRef((props: VaultProps, ref: RefType) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const vaultData = props.data;

  const migrationAvailable = vaultData.wido_together.includes(MIGRATION_KEY);

  const vaultTvl = vaultData.tvl.tvl_in_usd;
  const vaultAPY = vaultData.apy;

  const userTokenBalance = useAppSelector(
    selectTokenBalance(getNetwork(vaultData.chain_id), vaultData.address)
  );

  const handleVaultDetailClick = useCallback(() => {
    navigate(`/vault/${vaultData.address}/${vaultData.chain_id}`);
  }, [navigate, vaultData]);

  let migrationFlag;
  if (migrationAvailable) {
    migrationFlag = (
      <Tooltip title="Newer version of this vault is available. Yearn suggests to migrate your tokens to the latest vault version.">
        <OldLabel sx={{ marginLeft: 0.5 }} />
      </Tooltip>
    );
  }

  let ctaButton;
  if (migrationAvailable) {
    ctaButton = (
      <Button
        tabIndex={CONFIG.UX.TAB_INDEX.IMPORTANT}
        size="small"
        variant="outlined"
        startIcon={<ArrowForwardRounded />}
      >
        {WIDO_TOGETHER_LABEL[vaultData.chain_id][MIGRATION_KEY]}
      </Button>
    );
  } else {
    ctaButton = (
      <Button
        tabIndex={CONFIG.UX.TAB_INDEX.IMPORTANT}
        size="small"
        variant="outlined"
        startIcon={<AddRounded />}
      >
        {WIDO_TOGETHER_LABEL[vaultData.chain_id][DEPOSIT_KEY]}
      </Button>
    );
  }

  return (
    <Card
      ref={ref}
      className="no-tap-highlight"
      onClick={handleVaultDetailClick}
      elevation={0}
      tabIndex={CONFIG.UX.TAB_INDEX.IMPORTANT}
      sx={{
        "&": (theme) => ({
          border: "1px solid transparent",
          borderColor: theme.palette.divider,
          "&:hover, &:focus": {
            cursor: "pointer",
            borderColor: alpha(theme.palette.divider, 0.5),
          },
          "&:focus": {
            outline: 0,
          },
        }),
      }}
    >
      <CardContent sx={{ "&:last-child": { padding: 2 } }}>
        <Grid container alignItems="center" spacing={2}>
          {/* Vault name */}
          <Grid
            item
            container
            xs={12}
            sm={7}
            lg={5}
            spacing={1}
            alignItems="center"
          >
            <Grid item xs={12} display="flex" alignItems="center">
              <VaultIcon
                icons={vaultData.icon}
                iconImageAlt={vaultData.display_name}
              />
              <Typography
                sx={{ display: "inline", ml: 0.5, lineHeight: 1.3 }}
                variant="subtitle1"
              >
                {vaultData.display_name}
              </Typography>
              {migrationFlag}
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={0} direction="row" gap={0.5} flexWrap="wrap">
                <Tooltip title="This is a USD stablecoin vault">
                  <Chip
                    label="Stable"
                    size="small"
                    sx={{
                      borderRadius: 1,
                    }}
                    clickable={false}
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  />
                </Tooltip>
                <Tooltip
                  title={`Click to only see vaults on the ${getChainLabel(
                    vaultData.chain_id
                  )} network`}
                >
                  <NetworkChip
                    clickable
                    chainId={vaultData.chain_id}
                    onClick={(event) => {
                      event.stopPropagation();
                      dispatch(
                        patchLastGenericFilterList({
                          chain: [getChainLabel(vaultData.chain_id)],
                        })
                      );
                    }}
                  />
                </Tooltip>
                <Tooltip
                  title={`Click to only see vaults by ${vaultData.provider} protocol`}
                >
                  <Chip
                    sx={{
                      borderRadius: 1,
                      transition: "none",
                      "&:active": {
                        boxShadow: "none",
                      },
                    }}
                    tabIndex={-1}
                    label={vaultData.provider}
                    clickable
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      dispatch(
                        patchLastGenericFilterList({
                          provider: [vaultData.provider],
                        })
                      );
                    }}
                  />
                </Tooltip>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              {userTokenBalance.gt(0) && (
                <Typography
                  variant="caption"
                  sx={{ marginTop: 1 }}
                  component="div"
                  noWrap
                >
                  Balance{" "}
                  <Number>
                    {ethers.utils.formatUnits(
                      userTokenBalance,
                      vaultData.decimals
                    )}{" "}
                    {vaultData.symbol}
                  </Number>
                </Typography>
              )}
            </Grid>
          </Grid>

          {/* APY and TVL data */}
          <Grid
            item
            container
            xs={12}
            sm={5}
            lg={3}
            xl={4}
            spacing={2}
            direction="row"
            justifyContent="flex-start"
            flexWrap="nowrap"
          >
            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                color="#008A22" // TODO: use variable for this color
                fontWeight={800}
              >
                {formatAsPercentage(vaultAPY)}
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1}>
                APY
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={800}>
                {`$${formatAsShortNumber(vaultTvl, 2)}`}
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1}>
                TVL
              </Typography>
            </Grid>
          </Grid>

          {/* Vault Button */}
          <Grid item xs={12} lg={4} xl={3}>
            <Stack
              direction="row"
              gap={1}
              justifyContent="flex-end"
              flexWrap="wrap"
            >
              {ctaButton}
              <Button
                tabIndex={CONFIG.UX.TAB_INDEX.IMPORTANT}
                size="small"
                variant="outlined"
                startIcon={<ArrowForwardRounded />}
                sx={{ display: { md: "none" } }}
              >
                Detail
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
});
Vault.displayName = "Vault";

export default memo(Vault);
