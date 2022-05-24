import React from "react";

import { Stack, Typography } from "@mui/material";

import { SafeLink } from "../components/SafeLink";
import { Telegram, Twitter } from "@mui/icons-material";

export function Footer() {
  return (
    <Stack
      direction="row"
      justifyContent="center"
      spacing={8}
      sx={{
        marginBottom: "16px !important",
        marginX: "16px !important",
      }}
    >
      <SafeLink
        href="https://joinwido.com"
        title="Powered by Wido"
        color="accent"
        underline="hover"
      >
        <Typography variant="body2">Powered by Wido</Typography>
      </SafeLink>
      <Stack direction="row" spacing={2}>
        <SafeLink
          href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fapp.joinwido.com%2F&amp;ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Ejoinwido&amp;region=follow_link&amp;screen_name=joinwido"
          title="Follow @joinwido on Twitter"
          underline="hover"
          color="accent"
        >
          <Twitter />
        </SafeLink>
        <SafeLink
          href="https://t.me/joinwido"
          title="Wido on Telegram"
          underline="hover"
          color="accent"
        >
          <Telegram />
        </SafeLink>
      </Stack>
      <SafeLink
        href="mailto:info@joinwido.com"
        title="Integrate your Protocol"
        color="accent"
        underline="hover"
      >
        <Typography variant="body2">Integrate your Protocol</Typography>
      </SafeLink>
    </Stack>
  );
}
