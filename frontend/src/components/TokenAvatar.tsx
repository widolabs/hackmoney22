import { Avatar, AvatarProps } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import React, { forwardRef } from "react";

type TokenAvatarProps = AvatarProps & {
  sx?: SystemStyleObject<Theme>;
  /**
   * @default "small"
   */
  size?: "small" | "large";
};
type RefType = ForwardedRef<HTMLDivElement>;

export const TokenAvatar = forwardRef(
  ({ sx = {}, size = "small", ...rest }: TokenAvatarProps, ref: RefType) => (
    <Avatar
      ref={ref}
      sx={(theme) => ({
        backgroundColor: "transparent",
        borderColor: `${theme.palette.background.paper} !important`,
        width: size === "small" ? 16 : 32,
        height: size === "small" ? 16 : 32,
        ["&.MuiAvatar-colorDefault"]: {
          fontSize: theme.typography.caption.fontSize,
          color: theme.palette.common.white,
          background: theme.palette.grey[800],
        },
        ...sx,
      })}
      {...rest}
    />
  )
);
TokenAvatar.displayName = "TokenAvatar";
