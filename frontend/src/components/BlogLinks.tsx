import { Stack, Typography } from "@mui/material";
import React from "react";
import { SafeLink } from "./SafeLink";

export function BlogLinks() {
  return (
    <Stack margin={3}>
      <Typography variant="subtitle1" gutterBottom>
        From our Blog
      </Typography>

      <ul style={{ paddingLeft: 16 }}>
        <li>
          <SafeLink
            underline="hover"
            href="https://www.joinwido.com/wido-together"
          >
            Gasless Transactions
          </SafeLink>
        </li>
        <li>
          <SafeLink
            underline="hover"
            href="https://www.joinwido.com/blog/talk-to-us-and-earn-usdc"
          >
            Give feedback, get $30 USDC
          </SafeLink>
        </li>
      </ul>
      <SafeLink underline="hover" href="https://www.joinwido.com/blog">
        Open Blog
      </SafeLink>
    </Stack>
  );
}
