import { Chip, ChipProps } from "@mui/material";
import React, { ForwardedRef, forwardRef } from "react";
import { ImageURI } from "../utils/logo";
import { TokenAvatar } from "./TokenAvatar";

type TokenChipProps = ChipProps & {
  icon: ImageURI;
};

export const TokenChip = forwardRef(
  (props: TokenChipProps, ref: ForwardedRef<HTMLDivElement>) => {
    const { icon, ...rest } = props;

    return (
      <Chip
        ref={ref}
        tabIndex={-1}
        avatar={<TokenAvatar src={icon} />}
        sx={{
          "&:not(:hover):not(:focus) .MuiAvatar-img": {
            filter: "grayscale(1)",
          },
          "&:active": {
            boxShadow: "none",
          },
        }}
        size="small"
        {...rest}
      />
    );
  }
);
TokenChip.displayName = "TokenChip";
