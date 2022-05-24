import { Box, BoxProps } from "@mui/material";
import React from "react";

export function Monospace(props: BoxProps & { number?: boolean }) {
  const { number = false } = props;
  return (
    <Box
      sx={(theme) => ({
        ...(number ? theme.typography.number : {}),
        ...theme.typography.monospace,
      })}
      component="span"
      {...props}
    />
  );
}
