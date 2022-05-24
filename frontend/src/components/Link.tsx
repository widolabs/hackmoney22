import React from "react";
import {
  alpha,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
} from "@mui/material";
import { LinkRounded } from "@mui/icons-material";

export type LinkProps = MuiLinkProps & {
  /**
   * @default false
   */
  showLinkIcon?: boolean;
};

export function Link(props: LinkProps) {
  const { children, showLinkIcon = false, ...rest } = props;

  return (
    <MuiLink
      sx={(theme) => ({
        ["&:not(:hover):not(:disabled) "]: {
          color: theme.palette.secondary.main,
          textDecorationColor: alpha(theme.palette.secondary.main, 0.5),
        },
      })}
      {...rest}
    >
      {showLinkIcon && (
        <LinkRounded
          fontSize="small"
          sx={{ marginY: -0.5, marginRight: 0.5 }}
        />
      )}
      {children}
    </MuiLink>
  );
}
