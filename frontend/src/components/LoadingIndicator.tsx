import { CircularProgress, Stack, StackProps, Typography } from "@mui/material";
import React from "react";

type LoadingIndicatorProps = StackProps & {
  /**
   * @default "Loading..."
   */
  label?: string;
};

export function LoadingIndicator(props: LoadingIndicatorProps) {
  const { label = "Loading...", ...rest } = props;

  return (
    <Stack
      height="100%"
      alignItems="center"
      justifyContent="center"
      spacing={1}
      {...rest}
    >
      <CircularProgress />
      <Typography>{label}</Typography>
    </Stack>
  );
}
