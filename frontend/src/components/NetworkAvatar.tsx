import { Avatar, AvatarProps } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import React, { forwardRef } from "react";

type NetworkAvatarProps = AvatarProps & { sx?: SystemStyleObject<Theme> };
type RefType = ForwardedRef<HTMLDivElement>;

export const networkAvatarStyles = {
  "& > img": {
    objectFit: "scale-down",
  },
};

export const NetworkAvatar = forwardRef(
  ({ sx = {}, ...rest }: NetworkAvatarProps, ref: RefType) => (
    <Avatar
      ref={ref}
      sx={() => ({
        ...networkAvatarStyles,
        ...sx,
      })}
      {...rest}
    />
  )
);
NetworkAvatar.displayName = "NetworkAvatar";
