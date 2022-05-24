import { Box, Typography } from "@mui/material";
import React from "react";
import { SafeLink } from "./SafeLink";

export function TermsOfService() {
  return (
    <Box m={3}>
      <SafeLink
        href="https://uploads-ssl.webflow.com/60aaaaf41b554440f4c3576f/617fbd173deacfb50a3d01e3_Wido%20ToS.pdf"
        title="Terms of Service"
        color="accent"
        underline="hover"
      >
        <Typography variant="body2">Terms of Service</Typography>
      </SafeLink>
    </Box>
  );
}
