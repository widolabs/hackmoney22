import React, { memo, MouseEvent } from "react";
import { ErrorRounded } from "@mui/icons-material";
import { Paper, Stack, Typography } from "@mui/material";
import { Link } from "../../components/Link";

export const VaultErrorFallback = memo(() => (
  <Paper>
    <Stack spacing={1} margin={2} direction="row">
      <ErrorRounded color="secondary" />
      <Typography>
        Loading this vault failed.
        {" Try "}
        <Link
          href="#"
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();
            window.location.reload();
          }}
        >
          refreshing.
        </Link>
      </Typography>
    </Stack>
  </Paper>
));

VaultErrorFallback.displayName = "VaultErrorFallback";
