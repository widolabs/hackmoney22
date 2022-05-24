import React from "react";
import { Link as RouterLink } from "react-router-dom";

import { Stack, Typography } from "@mui/material";

export default function Logo() {
  return (
    <RouterLink to="/" color="inherit" style={{ textDecoration: "none" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <img
          height="32px"
          src="https://uploads-ssl.webflow.com/61d5b57a99635946134f66aa/628b5dbbaed06b1b5b4d520a_logo-small.png"
          alt="Wido Logo"
        />
        <Typography
          sx={(theme) => ({
            fontSize: 20,
            fontWeight: 700,
            color: theme.palette.text.primary,
          })}
        >
          wido
        </Typography>
      </Stack>
    </RouterLink>
  );
}
