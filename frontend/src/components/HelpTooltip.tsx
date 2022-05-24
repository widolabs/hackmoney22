import { HelpOutlineRounded } from "@mui/icons-material";
import { Tooltip, TooltipProps } from "@mui/material";
import React from "react";

export const HelpTooltip = (props: Omit<TooltipProps, "children">) => (
  <Tooltip disableInteractive enterTouchDelay={0} {...props}>
    <HelpOutlineRounded
      sx={(theme) => ({
        marginLeft: 0.25,
        marginRight: -0.5,
        marginY: -0.5,
        fontSize: theme.typography.body1.fontSize,
        cursor: "help",
      })}
    />
  </Tooltip>
);
