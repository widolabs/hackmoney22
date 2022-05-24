import React, { memo } from "react";
import { ErrorRounded } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { Link } from "../components/Link";
import { Link as RouterLink } from "react-router-dom";

type RouteFallbackProps = {
  message: string;
};

export const RouteFallback = memo(({ message }: RouteFallbackProps) => {
  return (
    <Stack
      height="100vh"
      flexGrow={1}
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ padding: { xs: 2, md: 4 } }}
    >
      <ErrorRounded color="secondary" />
      <Typography>
        {message}
        {" Try "}
        <Link
          href="#"
          onClick={(event) => {
            event.preventDefault();
            window.location.reload();
          }}
        >
          refreshing
        </Link>
        {" or "}
        <Link to="/" component={RouterLink}>
          return to the main page.
        </Link>
      </Typography>
    </Stack>
  );
});
RouteFallback.displayName = "RouteFallback";
