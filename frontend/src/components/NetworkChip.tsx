import { alpha, Chip, ChipProps } from "@mui/material";
import React, { ForwardedRef, forwardRef } from "react";
import { ChainId } from "../state/reducers/tokenListSlice";
import { getChainColor } from "../utils/color";
import { getChainLabel } from "../utils/label";
import { getChainLogo } from "../utils/logo";
import { NetworkAvatar } from "./NetworkAvatar";

type NetworkChipProps = ChipProps & {
  chainId: ChainId;
  /**
   *
   * To not be confused with `variant` (which comes from MUI).
   *
   * @default "normal"
   */
  variation?: "normal" | "transparent";
};

export const NetworkChip = forwardRef(
  (props: NetworkChipProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { chainId, variation = "normal", ...rest } = props;

    return (
      <Chip
        ref={ref}
        tabIndex={-1}
        avatar={<NetworkAvatar src={getChainLogo(chainId)} />}
        label={getChainLabel(chainId)}
        sx={{
          transition: "none",
          borderRadius: 1,
          "&:not(:hover):not(:focus) .MuiAvatar-img": {
            filter: "grayscale(1)",
          },
          "&:active": {
            boxShadow: "none",
          },
          ...(variation === "normal"
            ? {
                "&:hover, &:focus": {
                  color: getChainColor(chainId),
                  backgroundColor: alpha(getChainColor(chainId), 0.2),
                },
              }
            : {}),
          ...(variation === "transparent"
            ? {
                backgroundColor: "transparent",
                filter: "grayscale(1)",
                cursor: "pointer",
              }
            : {}),
        }}
        size="small"
        {...rest}
      />
    );
  }
);
NetworkChip.displayName = "NetworkChip";
