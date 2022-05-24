import React, { useMemo, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { VaultIcon } from "../../components/VaultIcon";
import { getChainLabel } from "../../utils/label";
import { networkAvatarStyles } from "../../components/NetworkAvatar";
import { TokenAvatar } from "../../components/TokenAvatar";
import { ImageURI } from "../../utils/logo";
import { Vault } from "../../state/apiSlice";
import { Token } from "../../state/reducers/tokenListSlice";
import { chainIdMapping } from "../../state/reducers/vaultSlice";
import { useAppSelector } from "../../state/store";
import { selectTokenBalance } from "../../state/reducers/tokenSlice";
import { getNetwork } from "../../utils/network";
import { ethers } from "ethers";

// export type Asset = Token | Vault;
export type Asset = Vault;
type AssetPickerProps = {
  label: string;
  value?: Asset;
  onChange: (value: Asset) => void;
  tokens: Asset[];
  assets: Asset[];
  chainMap: Record<string, ImageURI>;
  showOwnedOnly?: boolean;
};
export function AssetPicker(props: AssetPickerProps) {
  const {
    label,
    value,
    onChange,
    showOwnedOnly = false,
    tokens,
    assets,
    chainMap,
  } = props;
  const [chainName, setChainName] = useState("");

  const filteredTokens = useMemo(() => {
    if (!chainName) return tokens;

    return tokens.filter(
      (token) => chainIdMapping[token.chain_id] === chainName
    );
  }, [tokens, chainName]);

  const filteredAssets = useMemo(() => {
    if (!chainName) return assets;

    return assets.filter(
      (asset) => chainIdMapping[asset.chain_id] === chainName
    );
  }, [assets, chainName]);

  return (
    <Box>
      <Typography variant="caption">{label}</Typography>
      <Stack direction="row">
        <FormControl color="secondary" variant="filled" sx={{ flex: 1 }}>
          <InputLabel shrink id="ws-from-token-label">
            {value ? (value.wido_together ? "Vault" : "Token") : "Asset"}
          </InputLabel>
          <Select
            id="ws-from-token-select" // TODO(daniel)
            labelId="ws-from-token-label"
            value={value || ""}
            onChange={(event) => {
              const asset = event.target.value as any;
              onChange(asset);
              setChainName(chainIdMapping[asset.chain_id]);
            }}
            sx={(theme) => ({
              border: "1px solid",
              borderColor: theme.palette.divider,
              borderTopLeftRadius: 4,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 4,
            })}
            variant="filled"
            size="small"
            fullWidth
            disableUnderline
            displayEmpty
            MenuProps={{
              sx: {
                maxHeight: 400,
                "& .MuiPaper-root": {
                  maxWidth: "min-content",
                },
              },
              keepMounted: true,
            }}
            renderValue={(vault: Asset) => (
              <Stack
                direction="column"
                spacing={0.5}
                flex={1}
                sx={{ marginY: 0.5 }}
              >
                {vault ? (
                  <Box display="flex" alignItems="baseline" sx={{ height: 27 }}>
                    <VaultIcon
                      sx={{ alignSelf: "center" }}
                      icons={vault.icon}
                      iconImageAlt={vault.display_name}
                      size="small"
                    />
                    <Typography
                      sx={{
                        display: "inline",
                        marginLeft: 0.5,
                        lineHeight: 1.3,
                      }}
                      variant="subtitle1"
                      noWrap
                    >
                      {vault.display_name}
                    </Typography>
                  </Box>
                ) : (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ height: 27 }}
                  >
                    <Box
                      sx={(theme) => ({
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        background: theme.palette.grey[400],
                      })}
                    />
                    <Box
                      sx={(theme) => ({
                        color: theme.palette.grey[500],
                      })}
                    >
                      Select
                    </Box>
                  </Stack>
                )}
              </Stack>
            )}
          >
            {/* TODO(daniel) Add autocomplete, filter out Celo? */}
            <ListSubheader>Tokens</ListSubheader>
            {filteredTokens.map((asset) => (
              <AssetMenuItem
                key={`${asset.address}/${asset.chain_id}`}
                value={asset}
                vault={asset}
                showOwnedOnly={showOwnedOnly}
              />
            ))}
            <ListSubheader>Vaults</ListSubheader>
            {filteredAssets.map((asset) => (
              <AssetMenuItem
                key={`${asset.address}/${asset.chain_id}`}
                value={asset}
                vault={asset}
                showOwnedOnly={showOwnedOnly}
              />
            ))}
          </Select>
        </FormControl>
        <FormControl color="secondary" variant="filled" sx={{ flexBasis: 160 }}>
          <InputLabel shrink id="ws-from-token-label">
            Network
          </InputLabel>
          <Select
            id="ws-from-token-select"
            labelId="ws-from-token-label"
            value={chainName}
            displayEmpty
            renderValue={(chainName) => (
              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ marginY: 0.5, height: 27 }}
              >
                {chainName ? (
                  <>
                    <TokenAvatar
                      alt={chainName}
                      src={chainMap[chainName]}
                      sx={networkAvatarStyles}
                    />
                    <span>{chainName || "Network"}</span>
                  </>
                ) : (
                  <>
                    <Box
                      sx={(theme) => ({
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        background: theme.palette.grey[400],
                      })}
                    />
                    <Box
                      sx={(theme) => ({
                        color: theme.palette.grey[500],
                      })}
                    >
                      Select
                    </Box>
                  </>
                )}
              </Stack>
            )}
            onChange={(event) => {
              setChainName(event.target.value);
            }}
            sx={(theme) => ({
              border: "1px solid",
              borderLeft: 0,
              borderColor: theme.palette.divider,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
              borderBottomLeftRadius: 0,
            })}
            variant="filled"
            size="small"
            fullWidth
            disableUnderline
          >
            {/* <ListSubheader>Select Token or Vault</ListSubheader> */}
            {Object.keys(chainMap).map((chainName) => (
              <MenuItem
                key={chainName}
                value={chainName}
                sx={{
                  borderRadius: 1,
                  margin: 0.5,
                }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TokenAvatar
                    alt={chainName}
                    src={chainMap[chainName]}
                    sx={networkAvatarStyles}
                  />
                  <span>{chainName}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Box>
  );
}
export function AssetMenuItem({ vault, showOwnedOnly, ...rest }) {
  const balance = useAppSelector(
    selectTokenBalance(getNetwork(vault.chain_id), vault.address)
  );

  if (showOwnedOnly && balance.eq(0)) return null;

  return (
    <MenuItem
      sx={{
        minHeight: 56,
        borderRadius: 1,
        margin: 0.5,
        minWidth: 320,
      }}
      {...rest}
    >
      <Stack direction="column" spacing={0.5} flex={1}>
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <VaultIcon
            icons={vault.icon}
            iconImageAlt={vault.display_name}
            size="small"
          />
          <Typography
            sx={{
              display: "inline",
              marginLeft: 0.5,
              lineHeight: 1.3,
            }}
            variant="subtitle1"
            noWrap
          >
            {vault.display_name}
          </Typography>
          {vault.provider && (
            <Typography variant="caption">by {vault.provider}</Typography>
          )}
          <Typography variant="caption">
            • {getChainLabel(vault.chain_id)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Typography variant="caption">
            {ethers.utils.formatUnits(balance, vault.decimals)} {vault.symbol}
            {" available"}
          </Typography>
        </Stack>
      </Stack>
    </MenuItem>
  );
}
