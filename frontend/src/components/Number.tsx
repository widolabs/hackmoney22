import { Box, BoxProps } from "@mui/material";
import React from "react";

export function Number(props: BoxProps) {
  return (
    <Box sx={(theme) => theme.typography.number} component="span" {...props} />
  );
}
