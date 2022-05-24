import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import React from "react";
import { SafeLink } from "../../components/SafeLink";
import { getNetworkExplorerURL } from "../../utils/network";
import { Vault } from "../../state/apiSlice";
import { useAppSelector } from "../../state/store";
import { shortenWalletAddress } from "../../utils/utils";
import { NetworkChip } from "../../components/NetworkChip";
import { Monospace } from "../../components/Monospace";
import { BaseTokenCard } from "./BaseTokenCard";
import { TokenAvatar } from "../../components/TokenAvatar";
import { selectTokenByAddress } from "../../state/reducers/tokenListSlice";
import { HelpTooltip } from "../../components/HelpTooltip";

type VaultDetailCardProps = {
  vault: Vault;
};

export function VaultDetailCard(props: VaultDetailCardProps) {
  const { vault } = props;
  const protocolLabel = vault.provider;

  const shareToken = useAppSelector(
    selectTokenByAddress(vault.chain_id, vault.address)
  );
  const assetToken = useAppSelector(
    selectTokenByAddress(vault.chain_id, vault.underlying_token_address)
  );

  return (
    <Card elevation={21} sx={{ height: "100%" }}>
      <CardContent>
        <Stack gap={3}>
          <Stack gap={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Vault type</Typography>
              <Chip
                size="small"
                label="USD stablecoin"
                sx={{ borderRadius: 1 }}
              />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Protocol</Typography>
              <Chip
                size="small"
                label={protocolLabel}
                sx={{ borderRadius: 1 }}
              />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Network</Typography>
              <NetworkChip chainId={vault.chain_id} />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">
                Share token
                <HelpTooltip
                  title={`Your investment in this vault is represented by ${shareToken.symbol}. You will receive ${shareToken.symbol} shares proportional to your investment into this vault. You will need this share tokens to withdraw. The share token can be transferred to someone else, granting them eligibility to withdraw.`}
                />
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TokenAvatar alt={shareToken.symbol} src={shareToken.logoURI} />
                <Typography variant="body2">{shareToken.symbol}</Typography>
              </Stack>
            </Stack>
            {vault.underlying_token_address && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">
                  Asset token
                  <HelpTooltip
                    title={`The native token this vault accepts and manages. Wido allows you to deposit in other tokens, like USDC. If you deposit in USDC, Wido will convert it to ${assetToken.symbol} and then deposit ${assetToken.symbol} into this vault for you.`}
                  />
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TokenAvatar
                    alt={assetToken.symbol}
                    src={assetToken.logoURI}
                  />
                  <Typography variant="body2">{assetToken.symbol}</Typography>
                </Stack>
              </Stack>
            )}
          </Stack>
          {Object.keys(vault.base_token).length > 0 && (
            <div>
              <Typography variant="subtitle2" gutterBottom>
                {Object.keys(vault.base_token).length > 1
                  ? "Exposure Tokens"
                  : "Exposure Token"}
              </Typography>
              <Stack>
                {vault.base_token.map((tokenAddress) => (
                  <BaseTokenCard
                    key={tokenAddress}
                    chainId={vault.chain_id}
                    address={tokenAddress}
                  />
                ))}
              </Stack>
            </div>
          )}
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Links
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Vault address</Typography>
              <Typography variant="body2">
                <SafeLink
                  showLinkIcon
                  href={`${getNetworkExplorerURL(vault.chain_id)}/address/${
                    vault.address
                  }`}
                >
                  <Monospace number>
                    {shortenWalletAddress(vault.address)}
                  </Monospace>
                </SafeLink>
              </Typography>
            </Stack>
            {vault.underlying_token_address && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Asset token address</Typography>
                <Typography variant="body2">
                  <SafeLink
                    showLinkIcon
                    href={`${getNetworkExplorerURL(vault.chain_id)}/address/${
                      vault.underlying_token_address
                    }`}
                  >
                    <Monospace number>
                      {shortenWalletAddress(vault.underlying_token_address)}
                    </Monospace>
                  </SafeLink>
                </Typography>
              </Stack>
            )}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
