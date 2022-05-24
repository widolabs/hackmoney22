import { Telegram, Twitter } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import React from "react";
import { SafeLink } from "./SafeLink";

export function Community() {
  return (
    <Stack margin={3}>
      <Typography variant="subtitle1" gutterBottom>
        Wido Community
      </Typography>

      <SafeLink
        href="https://twitter.com/intent/follow?original_referer=https%3A%2F%2Fapp.joinwido.com%2F&amp;ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Efollow%7Ctwgr%5Ejoinwido&amp;region=follow_link&amp;screen_name=joinwido"
        title="Follow @joinwido on Twitter"
        underline="hover"
        color="accent"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mt: 1,
        }}
      >
        <Twitter fontSize="small" />
        Follow <b>@joinwido</b>
      </SafeLink>
      <SafeLink
        href="https://t.me/joinwido"
        title="Wido on Telegram"
        underline="hover"
        color="accent"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        <Telegram fontSize="small" />
        Wido on Telegram
      </SafeLink>
    </Stack>
  );
}
