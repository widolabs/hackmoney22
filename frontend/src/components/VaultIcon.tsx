import { Avatar, AvatarGroup, AvatarProps } from "@mui/material";
import { SystemStyleObject, Theme } from "@mui/system";
import React, { memo } from "react";

type VaultAvatarProps = AvatarProps & {
  sx?: SystemStyleObject<Theme>;
  /**
   * @default "medium"
   */
  size?: "medium" | "large";
};

const VaultAvatar = memo(({ sx, src, size, ...rest }: VaultAvatarProps) => (
  <Avatar
    src={src}
    sx={(theme) => ({
      ["&.MuiAvatar-colorDefault"]: {
        border: `1px solid ${theme.palette.background.paper}`,
        boxSizing: "border-box",
        fontSize:
          size === "large"
            ? theme.typography.h6.fontSize
            : theme.typography.caption.fontSize,
        color: theme.palette.common.white,
        background: theme.palette.grey[800],
      },
      ...sx,
      // HACK for saddle icon
      backgroundColor:
        src && src.includes("saddle") ? theme.palette.grey[800] : undefined,
    })}
    {...rest}
  />
));
VaultAvatar.displayName = "VaultAvatar";

type VaultIconProps = {
  icons: string[];
  iconImageAlt: string;
  /**
   * @default "medium"
   */
  size?: "small" | "medium" | "large";
};

export function VaultIcon(props: VaultIconProps) {
  const { icons, iconImageAlt, size = "medium" } = props;

  const avatarSize = size === "small" ? 14 : size === "medium" ? 18 : 48;
  // When we have multiple icons we shrink them to fit
  const avatarSizeForGroups =
    size === "small" ? 12 : size === "medium" ? 18 : 32;

  return (
    <AvatarGroup
      sx={{
        "& > .MuiAvatar-root": { border: 0 },
        ...(icons[1]
          ? {
              "& > .MuiAvatar-root:first-of-type": {
                height: avatarSizeForGroups,
                width: avatarSizeForGroups,
                marginTop: `${avatarSizeForGroups / 2}px`,
                marginLeft: `-${avatarSizeForGroups / 2}px`,
              },
              "& > .MuiAvatar-root:last-of-type": {
                height: avatarSizeForGroups,
                width: avatarSizeForGroups,
              },
            }
          : {}),
      }}
      variant="rounded"
    >
      <VaultAvatar
        alt={iconImageAlt}
        src={icons[0]}
        sx={{ width: avatarSize, height: avatarSize }}
        size={size}
      />
      {icons[1] && (
        <VaultAvatar alt={iconImageAlt} src={icons[1]} size={size} />
      )}
    </AvatarGroup>
  );
}
