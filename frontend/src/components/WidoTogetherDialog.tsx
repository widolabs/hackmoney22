import React from "react";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";

import { useMediaQuery, useTheme } from "@mui/material";

import WidoTogetherForm, { WidoTogetherFormProps } from "./WidoTogetherForm";
import { useAnalytics } from "../hooks/useAnalytics";

const BootstrapDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "600px",
  },
});

type WidoTogetherDialogProps = WidoTogetherFormProps & {
  isOpen: boolean;
};

export default function WidoTogetherDialog(props: WidoTogetherDialogProps) {
  const open = props.isOpen;
  const handleClose = props.onClose;
  // TODO: Remove chainLabel is instead use `network` to derive it.

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const analytics = useAnalytics();

  if (props.unsupported && open) {
    analytics?.track("order_not_supported", {
      type: props.type,
      network: props.network,
      fromTokenAddress: props.fromTokens[0].address,
      toTokenAddress: props.toTokens[0].address,
    });
  }

  return (
    <BootstrapDialog
      fullScreen={fullScreen}
      onClose={handleClose}
      aria-labelledby="wido-together-dialog-title"
      open={open}
    >
      <WidoTogetherForm {...props} />
    </BootstrapDialog>
  );
}
